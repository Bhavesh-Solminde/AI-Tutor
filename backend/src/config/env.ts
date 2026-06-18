import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("5000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // MongoDB
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

  // Auth
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
  GITHUB_CLIENT_ID: z.string().min(1, "GITHUB_CLIENT_ID is required"),
  GITHUB_CLIENT_SECRET: z.string().min(1, "GITHUB_CLIENT_SECRET is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),

  // OpenAI
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),

  // Cohere
  COHERE_API_KEY: z.string().min(1, "COHERE_API_KEY is required"),

  // Pinecone
  PINECONE_API_KEY: z.string().min(1, "PINECONE_API_KEY is required"),
  PINECONE_INDEX: z.string().default("neuralnest-os"),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),

  // LangSmith
  LANGCHAIN_TRACING_V2: z.string().default("true"),
  LANGCHAIN_API_KEY: z.string().optional(),
  LANGCHAIN_PROJECT: z.string().default("neuralnest-os"),

  // Tavily
  TAVILY_API_KEY: z.string().min(1, "TAVILY_API_KEY is required"),

  // Frontend
  FRONTEND_URL: z.string().default("http://localhost:3000"),

  // Backend URL (used for OAuth callback URIs — must match Google/GitHub console)
  BACKEND_URL: z.string().default("http://localhost:8080"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  parsed.error.issues.forEach((issue) => {
    console.error(`  ${issue.path.join(".")}: ${issue.message}`);
  });
  process.exit(1);
}

export const env = parsed.data;

// ─── LangSmith — must be set in process.env BEFORE any @langchain/* import ───
// LangChain reads these keys directly from process.env at module initialisation.
// Zod validates them but doesn't write them back, so we do it explicitly here.
process.env.LANGCHAIN_TRACING_V2 = env.LANGCHAIN_TRACING_V2;
process.env.LANGCHAIN_PROJECT = env.LANGCHAIN_PROJECT;
if (env.LANGCHAIN_API_KEY) {
  process.env.LANGCHAIN_API_KEY = env.LANGCHAIN_API_KEY;
  // New LangSmith SDK also reads LANGSMITH_API_KEY
  process.env.LANGSMITH_API_KEY = env.LANGCHAIN_API_KEY;
}
// Ensure the tracing endpoint is set (defaults to LangSmith cloud)
if (!process.env.LANGCHAIN_ENDPOINT) {
  process.env.LANGCHAIN_ENDPOINT = "https://api.smith.langchain.com";
}

