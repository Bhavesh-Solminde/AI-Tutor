import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { env } from "./env";

// ─── Google OAuth Strategy ───────────────────────────────────────────────────
passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${env.BACKEND_URL}/api/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          const email = profile.emails?.[0]?.value ?? "";
          // Check if email already registered via local
          const existing = await User.findOne({ email });
          if (existing) {
            // Link Google to existing account
            existing.googleId = profile.id;
            existing.authProvider = "google";
            await existing.save();
            return done(null, existing);
          }
          user = await User.create({
            googleId: profile.id,
            email,
            name: profile.displayName,
            avatar: profile.photos?.[0]?.value ?? "",
            authProvider: "google",
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

// ─── GitHub OAuth Strategy ───────────────────────────────────────────────────
passport.use(
  new GitHubStrategy(
    {
      clientID: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      callbackURL: `${env.BACKEND_URL}/api/auth/github/callback`,
      scope: ["user:email"],
    },
    async (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
      try {
        let user = await User.findOne({ githubId: profile.id });
        if (!user) {
          const email =
            profile.emails?.[0]?.value ??
            `${profile.username}@github.com`;
          const existing = await User.findOne({ email });
          if (existing) {
            existing.githubId = profile.id;
            await existing.save();
            return done(null, existing);
          }
          user = await User.create({
            githubId: profile.id,
            email,
            name: profile.displayName || profile.username,
            avatar: profile.photos?.[0]?.value ?? "",
            authProvider: "github",
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

// ─── Local Strategy (email + password) ───────────────────────────────────────
passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email, authProvider: "local" }).select(
          "+passwordHash"
        );
        if (!user || !user.passwordHash) {
          return done(null, false, { message: "Invalid email or password" });
        }
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          return done(null, false, { message: "Invalid email or password" });
        }
        return done(null, user);
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

export default passport;
