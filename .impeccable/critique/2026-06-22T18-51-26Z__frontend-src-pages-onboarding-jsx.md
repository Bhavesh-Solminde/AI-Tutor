---
target: frontend/src/pages/Onboarding.jsx
total_score: 36
p0_count: 0
p1_count: 1
timestamp: 2026-06-22T18-51-26Z
slug: frontend-src-pages-onboarding-jsx
---
#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 5 | Excellent stepper and spinner feedback |
| 2 | Match System / Real World | 5 | Logical 3-step wizard maps to user expectations |
| 3 | User Control and Freedom | 5 | Back buttons work flawlessly without losing state |
| 4 | Consistency and Standards | 3 | Palette drift: Yellow and purple introduced for card selection |
| 5 | Error Prevention | 5 | Wizard validates input before proceeding |
| 6 | Recognition Rather Than Recall | 5 | Pre-populates extracted topics for rating |
| 7 | Flexibility and Efficiency | 5 | Dropzone accepts multiple formats |
| 8 | Aesthetic and Minimalist Design | 3 | The rainbow-colored active cards break the "Restrained" aesthetic |
| 9 | Error Recovery | 5 | Backend errors surface perfectly in red semantic boxes |
| 10 | Help and Documentation | 5 | "Recommended" badges guide the user |
| **Total** | | **36/40** | **Great (Minor Polish Needed)** |

#### Anti-Patterns Verdict

**LLM assessment**: The Onboarding flow is structurally excellent, featuring a crisp stepper, elegant drag-and-drop, and highly informative tooltips. However, `ExplanationLevelCard.jsx` commits a major semantic violation: it styles the active state of the cards with "rainbow" colors (`emerald`, `yellow`, `purple`) depending on the difficulty level. `DESIGN.md` explicitly forbids introducing random accent colors like purple and yellow. All active selections must use the unified `primary`/`accent` token to maintain a "Restrained" aesthetic. There is also a minor typo in `Onboarding.jsx` where the dark mode text color for the input tabs uses `dark:text-primary` instead of `dark:text-accent`.

**Deterministic scan**: The CLI detector found 0 automated violations.

#### Overall Impression
This is a high-converting, professional setup wizard. Removing the jarring multi-colored active states will immediately elevate it to a premium feel.

#### What's Working
- **DropZone**: The file drop zone flawlessly utilizes `emerald` for the success state and `red` for unsupported file type errors.
- **Progress Stepper**: The stepper bar properly uses `emerald` for completed steps, `primary` for the active step, and `slate` for upcoming steps. This is perfect semantic application.

#### Priority Issues

- **[P1] What**: Semantic Palette Drift (Rainbow Cards)
  - **Why it matters**: Using different colors for active cards makes the UI feel like a generic SaaS template rather than a disciplined, premium brand. Active states should be strictly `primary`.
  - **Fix**: 
    1. In `ExplanationLevelCard.jsx`, remove the `if/else` block that checks for `beginner/intermediate/advanced`. 
    2. Instead, if a card is `active`, unconditionally apply `border-primary bg-primary/5` and `text-primary bg-primary/20` classes (with their `accent` dark mode counterparts).
    3. In `Onboarding.jsx`, update the active tab styling from `dark:text-primary` to `dark:text-accent`.
  - **Suggested command**: `$impeccable polish`

#### Persona Red Flags
None.

#### Questions to Consider
- If users want to skip Step 3 (Mastery Rating) and leave everything at Beginner, is it obvious enough that they can just click "Generate Roadmap"?
