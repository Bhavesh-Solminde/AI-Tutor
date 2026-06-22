---
target: frontend/src/pages/Profile.jsx
total_score: 37
p0_count: 0
p1_count: 1
timestamp: 2026-06-22T18-46-43Z
slug: frontend-src-pages-profile-jsx
---
#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 5 | The heatmap and stat cards provide excellent visibility |
| 2 | Match System / Real World | 5 | Uses standard profile and settings paradigms |
| 3 | User Control and Freedom | 5 | Inline editing of exam date and difficulty is very smooth |
| 4 | Consistency and Standards | 3 | Palette drift: Hardcoded hex, `orange` streaks, `emerald` activity |
| 5 | Error Prevention | n/a | |
| 6 | Recognition Rather Than Recall | 5 | Heatmap gives a clear visual history of effort |
| 7 | Flexibility and Efficiency | 5 | No separate "edit mode" page required; fields are inline |
| 8 | Aesthetic and Minimalist Design | 4 | Clean layout, but the varied stat colors break the "Restrained" rule |
| 9 | Error Recovery | n/a | |
| 10 | Help and Documentation | n/a | |
| **Total** | | **37/40** | **Great (Minor Polish Needed)** |

#### Anti-Patterns Verdict

**LLM assessment**: The Profile page functions very well but suffers from severe palette drift. First, `Profile.jsx` uses hardcoded hex values (`#3B6BFF`) instead of the Tailwind `primary` token for links and buttons. Second, the `UserProfileCard` introduces `orange-500` for streaks and `amber-500` for XP, which violates the strict semantic rules (Amber = learning, Orange = illegal). Finally, the `MasteryHeatmap` uses `emerald-500` to indicate general "Study Activity," but Emerald is strictly reserved for *completed mastery*. The heatmap should use the primary accent color scale instead.

**Deterministic scan**: The CLI detector found 0 automated violations.

#### Overall Impression
The layout is solid and the inline-editing UX is top-notch. The components just need to be reined in to match the disciplined color system we've established across the rest of the application.

#### What's Working
- **Inline Editing**: Clicking "Change" on the Exam Date toggles an inline input seamlessly without requiring a heavy modal or separate settings page.
- **Data Density**: The `UserProfileCard` and `MasteryHeatmap` pack a lot of valuable data into a very small, scannable footprint.

#### Priority Issues

- **[P1] What**: Semantic Palette Drift (Hex, Orange, Emerald)
  - **Why it matters**: The "Restrained" aesthetic relies on a single accent color (Primary) and strict semantic states. Hardcoded hex colors break dark mode theming. Using Emerald for general activity dilutes its meaning as the "Mastery" indicator.
  - **Fix**: 
    1. In `Profile.jsx`, swap all `#3B6BFF` references to the `primary` token.
    2. In `UserProfileCard.jsx`, swap the `orange` and `amber` stats to the `primary` token. (Leave the `emerald` Topics Done stat as-is, since it genuinely represents completed mastery).
    3. In `MasteryHeatmap.jsx`, swap the `emerald` scale to a `primary` scale.
  - **Suggested command**: `$impeccable polish`

#### Persona Red Flags
None.

#### Questions to Consider
- Should we add a quick link in the Profile page to jump back to the active Roadmap or Exam Mode?
