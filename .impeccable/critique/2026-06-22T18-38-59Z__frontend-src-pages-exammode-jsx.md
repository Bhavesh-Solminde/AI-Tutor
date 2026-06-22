---
target: frontend/src/pages/ExamMode.jsx
total_score: 36
p0_count: 0
p1_count: 1
timestamp: 2026-06-22T18-38-59Z
slug: frontend-src-pages-exammode-jsx
---
#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 5 | The dual view (canvas + timeline) provides exceptional visibility |
| 2 | Match System / Real World | 5 | Day-by-day rescue blocks map perfectly to cramming |
| 3 | User Control and Freedom | 5 | The destructive "Reset Exam" flow is well-handled |
| 4 | Consistency and Standards | 3 | Palette drift: Purple introduced for mock exams |
| 5 | Error Prevention | 5 | Setup wizard validates before proceeding |
| 6 | Recognition Rather Than Recall | 5 | All topics are visible in the timeline |
| 7 | Flexibility and Efficiency | 5 | Setup skips (like skipping PYQs) are smooth |
| 8 | Aesthetic and Minimalist Design | 4 | Clean, but the rogue purple breaks the strict system |
| 9 | Error Recovery | 4 | |
| 10 | Help and Documentation | n/a | |
| **Total** | | **36/40** | **Great (Minor Polish Needed)** |

#### Anti-Patterns Verdict

**LLM assessment**: The Exam Mode page is functionally brilliant. The Setup Wizard correctly uses the semantic palette (Primary for active steps, Emerald for completed). However, the Day-by-Day Rescue Timeline commits a major semantic violation: it introduces `purple-500` and `purple-700` to highlight "Mock Exam" blocks. `DESIGN.md` explicitly forbids introducing random accent colors (like purple, pink, etc.) to make things "pop." It must adhere to the single-accent (primary) rule. The "Days Left" badge uses Red, which is borderline but acceptable given the "rescue/urgency" context of this specific feature.

**Deterministic scan**: The CLI detector found 0 automated violations.

#### Overall Impression
This surface handles a huge amount of complexity (wizards, graphs, nested timelines) with grace. The UX is top-tier. It just needs a quick strict-palette enforcement pass.

#### What's Working
- **Step Wizard**: The 3-step setup uses the `primary` -> `emerald` status logic perfectly.
- **Timeline Accordions**: The expanding day blocks with the subtle dot indicators are highly scannable.

#### Priority Issues

- **[P1] What**: Semantic Palette Drift (Rogue Purple)
  - **Why it matters**: `DESIGN.md` enforces a "Restrained" aesthetic with only one brand accent color (Primary Blue) and three strict semantic states (Emerald, Amber, Red). Purple is an illegal color token.
  - **Fix**: Swap the `bg-purple-500` and `text-purple-700` classes in the "Mock Exam" timeline blocks to the `primary` accent color. The `Target` icon already differentiates it enough from standard topics.
  - **Suggested command**: `$impeccable polish`

#### Persona Red Flags
None.

#### Questions to Consider
- Does the "Days Left" badge in Red feel too aggressive if the exam is still 6 months away? Should it be dynamic (Primary > Amber > Red) based on proximity?
