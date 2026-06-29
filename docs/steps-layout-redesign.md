# Steps Section — Layout Redesign Spec

## Overview

Change the **"How it works"** steps section on the landing page from the current **horizontal-scroll / full-viewport-panel** layout to a **staggered sticky-note / pinboard layout** — alternating left-right cards connected by a dashed vertical timeline.

| | Current | Target |
|---|---|---|
| **Layout** | Horizontal scroll — 3 full-screen panels side-by-side | Vertical timeline — cards alternate left / right |
| **Scroll behaviour** | `position: sticky` + scroll-jacked `translateX` | Normal page scroll — no scroll-jacking |
| **Card style** | Dark glass-card (`bg-[#1A1F2E]`, white border) | Light "sticky note" card with a coloured pin icon |
| **Background** | Dark (`#181818`) | Warm off-white `#f6f5f1` |
| **Connection** | None | Dashed vertical line connecting the cards |

---

## Files to Change

### 1. [`frontend/src/components/landing/HorizontalScrollSteps.jsx`](file:///c:/Users/dhruv/Desktop/adaptive_ai/frontend/src/components/landing/HorizontalScrollSteps.jsx)

Replace the entire component with the sticky-note layout below.  
**Keep the same default export name** so existing imports don't break.

#### Layout Structure

```
Section wrapper  (bg #f6f5f1, py-24, relative)
│
├── Section header  (centred)
│     "How it works"
│     "Three steps. One agent loop."
│
└── Timeline wrapper  (max-w-4xl mx-auto, relative)
     │
     ├── Vertical dashed line  (absolute, centred, full height)
     │
     ├── Step 01 card  ── LEFT-aligned  (45% width on md+)
     │   ├── Pin — 3D sphere  (#e57a5b, centred top, radial-gradient + drop-shadow)
     │   ├── "01"  (muted serif, #9b8f7e)
     │   ├── Heading
     │   ├── Body text
     │   └── Tag pill
     │
     ├── Step 02 card  ── RIGHT-aligned
     │   ├── Pin — 3D sphere  (#7a90e5)
     │   └── ...
     │
     └── Step 03 card  ── LEFT-aligned
         ├── Pin — 3D sphere  (#7abbe5)
         └── ...
```

---

## Step Data (content unchanged)

```js
const STEPS = [
  {
    number: "01",
    pinColor: "#e57a5b",   // warm orange-red
    cardBg:  "#fff8f5",    // peachy warm white
    label:  "Upload your syllabus",
    detail: "NeuralNest extracts every topic, due date, and reading assignment directly from your course materials.",
    tag:    "topicExtractor.ts → Pinecone",
  },
  {
    number: "02",
    pinColor: "#7a90e5",   // periwinkle blue
    cardBg:  "#f5f6ff",    // soft lavender
    label:  "Agents build your map.",
    detail: "Our multi-agent system constructs a dynamic cognitive map, identifying dependencies and pre-requisite knowledge gaps.",
    tag:    "router → tutorNode → gradeNode",
  },
  {
    number: "03",
    pinColor: "#7abbe5",   // sky blue
    cardBg:  "#f5fbff",    // sky tint
    label:  "Master the material.",
    detail: "As you learn and pass adaptive quizzes, your mastery rating deterministically increases until you're ready for the exam.",
    tag:    "masteryCalculator.ts · no LLM",
  },
];
```

---

## 3D Pin Design

The pin icon on top of each card should have a **3D sphere appearance** using CSS radial gradients and a drop shadow:

```jsx
{/* 3D Pin */}
<div className="flex justify-center mb-5">
  <div
    style={{
      width: "22px",
      height: "22px",
      borderRadius: "50%",
      background: `radial-gradient(circle at 35% 35%, ${lighten(step.pinColor)}, ${step.pinColor} 60%, ${darken(step.pinColor)} 100%)`,
      boxShadow: `0 4px 10px ${step.pinColor}88, inset 0 -2px 4px rgba(0,0,0,0.2)`,
    }}
  />
</div>
```

Since React doesn't have built-in lighten/darken, use **hardcoded highlight colors** per step:

| Step | Base color | Highlight (top-left) | Shadow color |
|---|---|---|---|
| 01 | `#e57a5b` | `#f4a98e` | `#b8512e` |
| 02 | `#7a90e5` | `#a8b8f4` | `#4a63c8` |
| 03 | `#7abbe5` | `#a8d8f4` | `#4a8fb8` |

```jsx
// Add pinHighlight to each STEPS entry, then use:
<div
  style={{
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    background: `radial-gradient(circle at 35% 35%, ${step.pinHighlight}, ${step.pinColor} 60%, ${step.pinShadow} 100%)`,
    boxShadow: `0 4px 10px ${step.pinColor}88, inset 0 -2px 4px rgba(0,0,0,0.2)`,
  }}
/>
```

---

## Full JSX Replacement

```jsx
import { motion } from "framer-motion";

const STEPS = [
  {
    number: "01",
    pinColor: "#e57a5b",
    pinHighlight: "#f4a98e",
    pinShadow: "#b8512e",
    cardBg: "#fff8f5",
    label: "Upload your syllabus",
    detail:
      "NeuralNest extracts every topic, due date, and reading assignment directly from your course materials.",
    tag: "topicExtractor.ts → Pinecone",
  },
  {
    number: "02",
    pinColor: "#7a90e5",
    pinHighlight: "#a8b8f4",
    pinShadow: "#4a63c8",
    cardBg: "#f5f6ff",
    label: "Agents build your map.",
    detail:
      "Our multi-agent system constructs a dynamic cognitive map, identifying dependencies and pre-requisite knowledge gaps.",
    tag: "router → tutorNode → gradeNode",
  },
  {
    number: "03",
    pinColor: "#7abbe5",
    pinHighlight: "#a8d8f4",
    pinShadow: "#4a8fb8",
    cardBg: "#f5fbff",
    label: "Master the material.",
    detail:
      "As you learn and pass adaptive quizzes, your mastery rating deterministically increases until you're ready for the exam.",
    tag: "masteryCalculator.ts · no LLM",
  },
];

export default function HorizontalScrollSteps() {
  return (
    <section
      id="how"
      className="relative py-24 px-6 overflow-hidden bg-[#f6f5f1] dark:bg-[#181818]"
    >
      {/* ── Section header ── */}
      <div className="text-center mb-20">
        <p
          className="text-xs font-mono uppercase tracking-widest mb-3"
          style={{ color: "#9b8f7e" }}
        >
          How it works
        </p>
        <h2
          className="font-display text-4xl font-black tracking-tight text-[#1a1a1a] dark:text-white"
        >
          Three steps. One agent loop.
        </h2>
      </div>

      {/* ── Timeline ── */}
      <div className="relative max-w-4xl mx-auto">

        {/* Curved connecting line (hidden on mobile) */}
        <svg
          className="hidden md:block absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ zIndex: 0 }}
        >
          <path
            d="M 22.5,12 Q 50,31 77.5,50 T 22.5,88"
            fill="none"
            stroke="#c8c4ba"
            strokeWidth="0.25"
            strokeDasharray="1.2,1.2"
          />
        </svg>

        <div className="flex flex-col gap-12 md:gap-0">
          {STEPS.map((step, i) => {
            const isLeft = i % 2 === 0;
            return (
              <div
                key={step.number}
                className={`relative z-10 flex flex-col md:flex-row ${
                  isLeft ? "md:justify-start" : "md:justify-end"
                } ${i > 0 ? "md:-mt-20" : ""}`}
              >
                <motion.div
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="w-full md:w-[45%] max-w-[420px] rounded-3xl p-3 pt-12 relative bg-white"
                  style={{
                    border: "1px solid rgba(0,0,0,0.08)",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                  }}
                >
                  {/* 3D Pin attached to the white outer card header */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
                    <div
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        background: `radial-gradient(circle at 35% 35%, ${step.pinHighlight}, ${step.pinColor} 60%, ${step.pinShadow} 100%)`,
                        boxShadow: `0 4px 10px ${step.pinColor}66, inset 0 -2px 4px rgba(0,0,0,0.2)`,
                      }}
                    />
                  </div>

                  {/* Inner colored card */}
                  <div
                    className="rounded-2xl p-6"
                    style={{
                      backgroundColor: step.cardBg,
                    }}
                  >
                    {/* Step number */}
                    <p
                      className="text-2xl font-bold mb-2"
                      style={{ color: "#9b8f7e", fontFamily: "Georgia, serif" }}
                    >
                      {step.number}
                    </p>

                    {/* Heading */}
                    <h3
                      className="text-xl font-bold mb-3"
                      style={{ color: "#1a1a1a" }}
                    >
                      {step.label}
                    </h3>

                    {/* Body */}
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "#555555" }}
                    >
                      {step.detail}
                    </p>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

---

## Colour Reference

| Usage | Hex |
|---|---|
| Section background | `#f6f5f1` |
| Card bg — Step 01 | `#fff8f5` (peachy warm white) |
| Card bg — Step 02 | `#f5f6ff` (soft lavender) |
| Card bg — Step 03 | `#f5fbff` (sky tint) |
| Pin — Step 01 | `#e57a5b` (warm orange-red) |
| Pin — Step 02 | `#7a90e5` (periwinkle blue) |
| Pin — Step 03 | `#7abbe5` (sky blue) |
| Dashed connector line | `#c8c4ba` |
| Step number | `#9b8f7e` (muted warm tan) |
| Heading text | `#1a1a1a` |
| Body text | `#555555` |
| Tag pill text | `#6b6b6b` |
| Tag pill bg | `rgba(0,0,0,0.05)` |

---

## Also Update: `LandingPage2.jsx` (lines 262–329)

The inline "How it works" section in [`LandingPage2.jsx`](file:///c:/Users/dhruv/Desktop/adaptive_ai/frontend/src/pages/LandingPage2.jsx) uses a dark `grid lg:grid-cols-3 gap-6` layout.

Apply the same pinboard style there:
- Change the `<section>` background to `style={{ backgroundColor: "#f6f5f1" }}`
- Replace the `grid lg:grid-cols-3` step cards with the alternating left/right layout above.
- Keep all step text content unchanged.

---

## Responsive Behaviour

| Breakpoint | Behaviour |
|---|---|
| `< md` (mobile) | All cards stacked full-width, centred; dashed line hidden |
| `≥ md` (tablet +) | Cards alternate left / right at 45% width; dashed line visible |

---

## Summary of Changes

1. **Remove** the `h-[300vh]` scroll-jack container, `sticky` positioning, and `motion.div x` transform from `HorizontalScrollSteps.jsx`.
2. **Replace** with a vertically stacked, alternating left/right "sticky note" card layout.
3. **Change** section background from dark (`#181818`) to warm off-white (`#f6f5f1`).
4. **Updated** step content to new labels and detail text.
5. **3D pins** via `radial-gradient` with per-step highlight, base, and shadow colors + `box-shadow` glow.
6. **Update** any parent wrapper in `Landing.jsx` that applies a dark background colour to this section.
