---
target: frontend/src/pages/Tutor.jsx
total_score: 36
p0_count: 0
p1_count: 1
timestamp: 2026-06-22T18-43-08Z
slug: frontend-src-pages-tutor-jsx
---
#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 5 | Typing indicators and material counts are perfect |
| 2 | Match System / Real World | 5 | Clean, conversational messaging interface |
| 3 | User Control and Freedom | 5 | Powerful toggles (Web Search, Doubt Mode) |
| 4 | Consistency and Standards | 3 | Palette drift: Hardcoded hex colors and semantic mismatches |
| 5 | Error Prevention | n/a | |
| 6 | Recognition Rather Than Recall | 5 | Comprehension chips prevent users from having to type |
| 7 | Flexibility and Efficiency | 5 | Floating pinned input is highly efficient |
| 8 | Aesthetic and Minimalist Design | 4 | Beautiful layout, but hardcoded `#3B6BFF` breaks theming |
| 9 | Error Recovery | 4 | Retry flow exists but uses the wrong color token |
| 10 | Help and Documentation | n/a | |
| **Total** | | **36/40** | **Great (Minor Polish Needed)** |

#### Anti-Patterns Verdict

**LLM assessment**: The Tutor page is structurally beautiful. The floating chat input and doubt-mode box are excellent UX patterns. However, it suffers from several semantic and theming violations. First, the "Retry" button (an error state) uses Amber instead of the required Red. Second, the "Proceed to Quiz" button uses Emerald (reserved for *completed* mastery) instead of Primary. Finally, `TutorChatPanel` uses hardcoded hex values (`#3B6BFF`) and `blue-600` classes for the mascot and send button, entirely bypassing the Tailwind `primary` token system and potentially breaking dark mode.

**Deterministic scan**: The CLI detector found 0 automated violations.

#### Overall Impression
The Tutor chat interface feels like a premium, native application. The pinned bottom input row is exceptionally well-designed. Fixing the color tokens will make it flawless.

#### What's Working
- **Adaptive Input**: The tools row (Attach, Web, Doubt) inside the input bubble is a superb, modern chat pattern.
- **Doubt Mode**: The amber alert box that floats above the input when Doubt Mode is active perfectly utilizes the semantic rules.

#### Priority Issues

- **[P1] What**: Semantic Palette Drift (Amber, Emerald, Hardcoded Hex)
  - **Why it matters**: `DESIGN.md` requires Red for errors, restricts Emerald to completed mastery, and forbids hardcoded colors in favor of the `primary` token.
  - **Fix**: 
    1. In `Tutor.jsx`, change the Retry button to use `red` tokens.
    2. In `Tutor.jsx`, change the "Proceed to Quiz" button to use `primary` tokens.
    3. In `TutorChatPanel.jsx`, replace all instances of `bg-[#3B6BFF]`, `hover:bg-blue-600`, and `shadow-blue-500` with the corresponding `primary` classes.
  - **Suggested command**: `$impeccable polish`

#### Persona Red Flags
None.

#### Questions to Consider
- Does the chat input need an auto-expanding `textarea` instead of a standard `input` so users can paste long multiline text?
