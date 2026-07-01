---
name: NeuralNest AI
description: The AI learning operating system that thinks, adapts, and teaches
colors:
  primary: "#3B6BFF"
  primary-hover: "#2F5AE0"
  primary-active: "#2952CC"
  bg-dark: "#181818"
  bg-light: "#F6F5F1"
  sidebar-dark: "#1C1C1C"
  sidebar-light: "#F3F4F6"
  surface-dark: "#222222"
  surface-light: "#FFFFFF"
  elevated-dark: "#2A2A2A"
  elevated-light: "#FFFFFF"
  border-dark: "#333333"
  border-light: "#E5E7EB"
  text-primary-dark: "#F3F4F6"
  text-primary-light: "#333333"
  text-muted-dark: "#9CA3AF"
  text-muted-light: "#555555"
  mastery-unstarted: "#9CA3AF"
  mastery-learning: "#FBBF24"
  mastery-mastered: "#10B981"
  mastery-cta: "#3B6BFF"
  semantic-error: "#EF4444"
  semantic-warning: "#F59E0B"
  semantic-info: "#3B82F6"
  semantic-hard: "#F43F5E"
typography:
  display:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "clamp(2rem, 5vw, 3.5rem)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Poppins, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Poppins, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.4
  body:
    fontFamily: "Poppins, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Poppins, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
  mono:
    fontFamily: "Geist Mono, JetBrains Mono, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.full}"
    padding: "8px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: "8px 24px"
  button-ghost-hover:
    backgroundColor: "rgba(59,107,255,0.05)"
  nav-item-active:
    backgroundColor: "#EFF6FF"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  nav-item-active-dark:
    backgroundColor: "#333333"
    textColor: "{colors.text-primary-dark}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  chip-mastered:
    backgroundColor: "rgba(16,185,129,0.1)"
    textColor: "#10B981"
    rounded: "{rounded.full}"
    padding: "2px 8px"
  chip-learning:
    backgroundColor: "rgba(251,191,36,0.1)"
    textColor: "#FBBF24"
    rounded: "{rounded.full}"
    padding: "2px 8px"
  chip-locked:
    backgroundColor: "rgba(156,163,175,0.1)"
    textColor: "{colors.mastery-unstarted}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
  input-default:
    backgroundColor: "rgba(255,255,255,0.6)"
    textColor: "{colors.text-primary-light}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  input-default-dark:
    backgroundColor: "{colors.elevated-dark}"
    textColor: "{colors.text-primary-dark}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
---

# Design System: NeuralNest AI

## 1. Overview

**Creative North Star: "The Neural Scaffold"**

NeuralNest's visual language begins from a single structural metaphor: a living architecture that reveals itself as you move through it — like a circuit diagram that comes alive under contact. The knowledge graph is not a feature; it IS the product. Every screen is a different cross-section of the same underlying scaffold: the Roadmap shows the full topology, the Dashboard summarizes your position within it, the Tutor Chat illuminates a single node, and Exam Mode stress-tests the scaffold's load-bearing edges.

This is a two-theme system built on a charcoal dark (`#181818` base) and a warm off-white (`#F6F5F1` light). Neither is a default — both are deliberate. The dark theme evokes focused late-night study sessions; the warm-tinted light theme communicates calm daylight competence, not clinical sterility. The primary accent — Electric Blueprint `#3B6BFF` — is the connective tissue: active navigation, primary CTAs, the progress ring, focus rings. It earns its presence through restraint, appearing on ≤15% of any given surface. The system uses Poppins for all product UI type (clean humanist geometry with warmth), Instrument Serif reserved for landing page and onboarding display moments only, and Geist Mono strictly for quantitative data.

Motion is responsive, not choreographic. Framer Motion is used for meaningful transitions (music player panel, modal enters/exits, animated waveform) — never for scroll reveals or entrance choreography in the product shell. State changes respond immediately; feedback is the only reason to animate.

**Key Characteristics:**
- Charcoal dark ramp (`#181818` → `#1C1C1C` → `#222222` → `#2A2A2A`) as four-stop depth architecture without glass
- Poppins for all product UI; Instrument Serif for landing/onboarding display only; Geist Mono for data
- `#3B6BFF` as systemic accent: navigation, CTA, progress ring — never decoration
- Three-state mastery vocabulary (gray / amber / emerald) as the semantic color system
- 8px base radius, scaling to 16px on cards, 24px on overlays — compact, never over-rounded
- Flat surfaces at rest; shadows appear only on hover and elevated overlays
- Pinboard (`pinboard-bg`) and grid (`grid-backdrop`) textures are structural, not decorative — used only on designated surfaces
- Framer Motion for meaningful transitions; all animations provide `prefers-reduced-motion` fallbacks

## 2. Colors: The Blueprint Palette

A committed single-accent palette: one primary blue as connective tissue, warm-tinted charcoal and off-white neutrals as the stage, and a three-state semantic vocabulary for the knowledge graph itself.

### Primary
- **Electric Blueprint** (`#3B6BFF`): The brand anchor. Used for: primary CTA buttons, active nav states, progress ring fill, focus rings. Never decorative. Hover: `#2F5AE0`. Active press: `#2952CC`. Shadow on primary buttons: `shadow-md`. Not as background fill, ambient glow, or border on non-interactive elements.

### Neutral — Dark Theme
- **Charcoal Base** (`#181818`): Page background in dark mode. The floor everything sits on.
- **Sidebar Ink** (`#1C1C1C`): Sidebar and secondary panel backgrounds — one step lifted from the page.
- **Surface Ink** (`#222222`): Primary card and surface background — the main content layer.
- **Elevated Ink** (`#2A2A2A`): Raised state — hover surfaces, modals, elevated cards, input backgrounds.
- **Graphite Border** (`#333333`): All dividers, borders, and separator lines in dark mode.
- **Fog** (`#9CA3AF`): Muted text, placeholders, secondary labels, timestamps.
- **Snow** (`#F3F4F6`): Primary text on dark surfaces.

### Neutral — Light Theme
- **Warm Paper** (`#F6F5F1`): Page background in light mode. Lightly warm-tinted off-white — held below cream saturation. The `pinboard-bg` ruled lines layer transparently over this.
- **Ash Sidebar** (`#F3F4F6`): Sidebar background in light mode.
- **Pure White** (`#FFFFFF`): Card and surface background.
- **Chalk Border** (`#E5E7EB`): Borders and dividers in light mode.
- **Ink** (`#333333`): Primary text in light mode.
- **Smoke** (`#555555`): Muted text, secondary labels, metadata.

### Semantic — Knowledge Graph States
- **Mastered Emerald** (`#10B981`): Mastered topic nodes, progress bars at completion, pass badges. Only for mastered state.
- **Learning Amber** (`#FBBF24`): In-progress nodes, pulsing ring animations, `animate-pulse-glow` keyframe. Only for learning/in-progress state.
- **Unstarted Gray** (`#9CA3AF`): Locked nodes, not-started chips, disabled icon color.
- **Error Red** (`#EF4444`): Wrong quiz answers, error states, field error borders.
- **Hard Rose** (`#F43F5E`): Difficulty-hard indicator in the knowledge graph. Semantically distinct from Error Red.

### Named Rules
**The Connective Tissue Rule.** `#3B6BFF` appears on ≤15% of any screen surface. It connects: active navigation, primary CTAs, and the progress ring. Not as a background fill, decorative border, or ambient glow. Every use must answer: "what action or state does this blue mark?"

**The Three-State Rule.** The mastery triad (gray / amber / emerald) is a semantic vocabulary, not a palette. These colors appear ONLY on the states they name. Amber is not a "warm accent." Rose is not a generic danger color. Each state color is owned by its semantic role.

**The Warmth Rule.** The warm tint on `#F6F5F1` is intentional — held at low saturation, enough to feel human, not enough to read as cream or parchment. Do not substitute a pure neutral or push the warmth further.

## 3. Typography

**Display Font:** Instrument Serif (italic variants, Georgia fallback) — landing page and onboarding display headings only
**Body / UI Font:** Poppins (weights 300–700, Google Fonts) — all product UI
**Mono Font:** Geist Mono (JetBrains Mono fallback) — data-only contexts

**Character:** Poppins is the backbone — a geometric humanist sans with enough warmth to avoid the SaaS-cold feeling of Inter or DM Sans. Its rounded terminals at 400-weight suit the product's "expert but not sterile" register. Instrument Serif appears only for display moments on the landing page and onboarding — where emotional investment needs a different register than the precision tool. Geist Mono provides clean, unambiguous data rendering.

### Hierarchy
- **Display** (Instrument Serif 400, `clamp(2rem, 5vw, 3.5rem)`, line-height 1.1, tracking -0.02em): Landing page hero and onboarding step display headings only. Never in authenticated product surfaces.
- **Headline** (Poppins 700, 24px / 1.5rem, line-height 1.25, tracking -0.01em): Card section titles, major widget headings, dashboard section labels.
- **Title** (Poppins 700, 18px / 1.125rem, line-height 1.4): Component headings, popup card topic names, sidebar section titles.
- **Body** (Poppins 400, 14px / 0.875rem, line-height 1.6): Primary reading text — chat messages, card descriptions, onboarding instructions. Cap at 65–75ch per line on prose surfaces.
- **Label** (Poppins 600, 12px / 0.75rem, line-height 1.4): Button labels, nav item text, chip text, form field labels. Sentence case only. Never uppercase except for mono data column headers.
- **Mono** (Geist Mono 400, 12px / 0.75rem, line-height 1.5): Topic indices (`#01`), percentage values, timestamps (`2h 45m`), table data. Uppercase in column headers only, with `tracking-wider`.

### Named Rules
**The Mono Gate Rule.** Geist Mono is used ONLY for quantitative data. Not for labels, descriptions, button text, or headings. If it can be read aloud as prose, it uses Poppins.

**The Instrument Serif Gate Rule.** Instrument Serif appears only on landing page display headings and onboarding steps. Never inside the authenticated product shell. Poppins carries all hierarchy there through weight alone.

## 4. Elevation

NeuralNest uses a hybrid elevation model: surfaces are flat at rest, with shadows emerging as a state response (hover, canvas overlay, modal). Depth is established primarily through tonal surface layering on the charcoal dark ramp.

**Dark tonal ramp (the architectural skeleton):**
`#181818` (page bg) → `#1C1C1C` (sidebar) → `#222222` (surface/card) → `#2A2A2A` (elevated/input). Four stops, no extras.

**Light tonal ramp:** `#F6F5F1` (page) → `#F3F4F6` (sidebar) → `#FFFFFF` (surface/card). Three stops.

### Shadow Vocabulary

- **Resting surfaces**: no shadow. Cards, table rows, and nav items use only border (`1px solid #333333` dark / `1px solid #E5E7EB` light) for separation.
- **Nav item active** (`shadow-sm`): Subtle lift on active nav items — communicates selection without lifting off the surface.
- **Hover lift** (`box-shadow: 0 8px 24px rgba(0,0,0,0.3)` / `shadow-xl`): Topic nodes on hover — `shadow-sm` → `shadow-xl` + `-translate-y-0.5`. Communicates interactivity.
- **Overlay / Popup** (`box-shadow: 0 24px 64px rgba(0,0,0,0.5)` / `shadow-2xl`): TopicPopupCard, modals, panels detached from the surface. Communicates true elevation above the canvas.
- **Learning Pulse glow** (`box-shadow: 0 0 10px–20px rgba(251,191,36,0.2–0.6)`): The `animate-pulse-glow` CSS keyframe on learning nodes. Semantic only — marks in-progress state, not decoration.

### Named Rules
**The Flat-at-Rest Rule.** No surface casts a shadow in its default state. Shadows are earned by interaction (hover), elevation above the canvas (popup/modal), or semantic state (learning pulse). A shadow at rest signals interactivity — it must be true.

**The One-Shadow Rule.** A component uses either a border OR a shadow — never both simultaneously in the same state. At rest: border only. On hover/elevated: shadow overrides the border visually via `shadow-xl`. The ghost-card pattern (1px border + wide blur simultaneously) is prohibited.

## 5. Components

NeuralNest's component vocabulary is refined and efficient: compact sizing, 8–16px radius, information-dense but never cramped. Components disappear into the task. The three signature components — TopicNode, TopicPopupCard, and StudyMusicPlayer — define the product's spatial and ambient character.

### Buttons
**Compact, confident, pill-shaped for primary, gently rounded for secondary.**

- **Shape:** Primary CTAs use `border-radius: 9999px` (full pill). Secondary/ghost CTAs use `border-radius: 16px` (rounded-2xl). Never `24px+` on non-overlay rectangles.
- **Primary** (`bg-cta #3B6BFF`, white text, `px-6 py-2`, `rounded-full`, `font-bold text-sm`): Single most important action per view. Shadow: `shadow-md`. Transition: `duration-300`.
- **Hover / Focus:** Background deepens to `#2F5AE0`. No scale transform on in-product buttons.
- **Ghost / Outline** (`border border-[#3B6BFF]`, transparent bg, `text-[#3B6BFF]`, `rounded-2xl`): Secondary action. Hover: `bg-primary/5`.
- **Icon-only**: `p-1 rounded-full`, hover: `opacity-80`. Used for X dismiss, small icon triggers.

### Chips / Status Badges
**Semantic-only: the mastery triad on tinted alpha backgrounds.**

- **Mastered:** `bg-emerald-500/10 text-emerald-500 border-emerald-500/20 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider`
- **Learning / In Progress:** `bg-amber-500/10 text-amber-500` — same shape.
- **Locked / Not Started:** `bg-slate-100/80 dark:bg-slate-800/80 text-slate-400` — same shape.
- **Difficulty pills:** `bg-emerald-500/10 text-emerald-500` (easy), `bg-amber-500/10 text-amber-500` (medium), `bg-rose-500/10 text-rose-500` (hard). `rounded-full px-3 py-1 text-[10px] font-bold capitalize`.
- **PYQ Hot Badge:** `bg-rose-500 text-white rounded-full px-2 py-0.5 text-[9px] font-bold border-2 border-white dark:border-slate-900`. Absolutely positioned at `-top-2 -right-2`.

### Cards / Containers
**Gently curved, tonal-layered, minimal border, no shadow at rest.**

- **Corner Style:** `border-radius: 16px` (rounded-2xl) on standard cards and widgets. `border-radius: 24px` (rounded-3xl) on overlays (PopupCard, modals).
- **Background:** `bg-white dark:bg-surface-dark (#222222)` for primary cards. `bg-slate-50/50 dark:bg-elevated-dark/20` for inset sub-sections.
- **Border:** `1px solid #E5E7EB` light / `1px solid #333333` dark. Present at rest; no shadow companion.
- **Shadow Strategy:** None at rest. `shadow-sm` on stat widgets. `shadow-2xl` on true overlays.
- **Internal Padding:** `p-6` (24px) standard; `p-4` (16px) compact widgets and table cells; `p-8` (32px) landing feature cards.
- **Nested cards:** Prohibited. Use `bg-slate-50/50 dark:bg-elevated-dark/20` tonal insets for sub-sections.

### Inputs / Fields
**Stroke-based, gently rounded, focus shifts border to primary blue.**

- **Style:** `bg-white/60 dark:bg-elevated-dark`, `border border-[#EAE8E1] dark:border-border-dark`, `rounded-xl` (12px). Body text `text-sm`. Placeholder: `text-slate-400`.
- **Focus:** `border-primary` — border color shifts only, no glow, no outer ring.
- **Transition:** `transition-all duration-300` on all input state changes.
- **Disabled:** `opacity-50 cursor-not-allowed`.
- **Error:** `border-red-400 dark:border-red-500` with `text-red-500` helper text + `XCircle` icon below.

### Navigation
**Sidebar: 210px fixed, dark `#1C1C1C` / light `#F3F4F6`. Sticky top-0.**

- **Nav items:** `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium`. Icon: 20×20px Lucide.
- **Default:** `text-text-muted`, no background.
- **Hover:** `bg-white/80 dark:bg-surface-dark/50`, text shifts to primary light / white dark.
- **Active:** `bg-[#EFF6FF] dark:bg-[#333333]`, `text-primary`, `border border-primary/10 dark:border-border-dark`, `shadow-sm`.
- **TopBar:** 64px fixed, `bg-surface-light dark:bg-surface-dark (#222222)`, `border-b`. Contains: hamburger (mobile) left; ThemeToggle + user avatar right.
- **Wordmark:** `NEURALNEST` in Poppins `font-extrabold tracking-tight`, plain `text-[#333333] dark:text-white`. Weight and tracking carry the identity — no gradient text effect.

### Topic Node (Signature Component)
**The graph's unit. 208px wide, `rounded-2xl`, three visual states.**

The TopicNode is the spatial language of the product: a compact card (`w-52 rounded-2xl border`) that lives in the React Flow canvas. Three states, no ambiguity:

- **Unstarted:** `bg-white border-[#EAE8E1]/70 dark:bg-slate-900/60 dark:border-slate-700/50`. Gray icon bg (`bg-white/80 dark:bg-slate-800`). Lock icon.
- **Learning:** `bg-amber-500/10 border-amber-500/30`. Amber icon bg. Sparkles icon (`animate-pulse`). Pulsing `ring-2 ring-amber-400/40` overlay (`animate-pulse-glow` keyframe).
- **Mastered:** `bg-emerald-500/10 border-emerald-500/30`. Emerald icon bg. Check icon.

Hover (all states): `shadow-xl -translate-y-0.5` (`transition-all duration-300`). Interior: mono index (`#01`, Geist Mono), icon badge (36×36px, `rounded-xl`), topic name (Poppins bold, `line-clamp-2`), difficulty dot + time row (Geist Mono), status pill (9px, uppercase, `rounded-full`), optional 1px mastery bar. PYQ badge (`bg-rose-500`) at `-top-2 -right-2`.

### Topic Popup Card (Signature Component)
**Glass overlay, absolutely positioned, max-width 380px, backdrop-blur-md.**

`bg-white/95 dark:bg-surface-dark/95 backdrop-blur-md border rounded-3xl shadow-2xl`. One of two sanctioned uses of `backdrop-blur` in the product. Internal layout: title + status badge + close X → 3-column stat grid (Time / Level / Mastery) in `rounded-2xl` inset cells → two full-width CTAs (primary pill + ghost outline). Stat grid cells: `bg-slate-50/50 dark:bg-elevated-dark/20 border rounded-2xl` — tonal insets, never nested shadow cards.

### Study Music Player (Signature Component)
**Persistent floating panel, Framer Motion animated, live waveform visualization.**

A fixed floating widget persisting across navigation. Collapsed state: compact pill (`rounded-2xl bg-surface-light/95 dark:bg-surface-dark/95 border backdrop-blur-sm`) with genre icon, track name, waveform bars, and play/pause control. Expanded state: `AnimatePresence` panel revealing genre selector (lofi / classical / natural / natural_rain / ambient with Lucide icons) and volume slider.

Waveform bars: 5 `motion.div` columns, staggered Framer Motion animation. Active: `scaleY` oscillates 0.8–1.6, `opacity: 1`. Paused: `scaleY: 0.3`, `opacity: 0.4`. Genre pills: active gets `bg-primary/10 text-primary border-primary/20`; inactive: `bg-slate-100 dark:bg-elevated-dark text-text-muted`. `prefers-reduced-motion` support required — static/crossfade fallback.

### Background Textures (Structural, Not Decorative)
Two surface textures are utility classes used only on specific designated surfaces:

- **`pinboard-bg`**: Horizontal ruled lines at 40px pitch (`repeating-linear-gradient`). Dark: `#181818` base, `rgba(255,255,255,0.07)` lines. Light: `#F6F5F1` base, `rgba(0,0,0,0.07)` lines. Used on the AI Tutor chat surface to evoke a study-notebook feel.
- **`grid-backdrop`**: 40×40px square grid crosshatch. Dark: `rgba(255,255,255,0.05)` lines. Light: `rgba(229,231,235,0.8)` lines. Used on the Roadmap canvas to establish spatial depth behind the React Flow graph.

These textures are NOT for general card backgrounds, sidebar panels, or decorative fills.

## 6. Do's and Don'ts

### Do:
- **Do** use `#3B6BFF` only on primary CTAs, active nav states, progress indicators, and focus rings. Its scarcity is the point.
- **Do** use the three-state mastery colors (gray / amber / emerald) exclusively for their named semantic states — locked, learning, mastered.
- **Do** use Geist Mono only for quantitative data: numbers, percentages, durations, topic indices. Not for labels, descriptions, or prose.
- **Do** use Instrument Serif only on landing page and onboarding display headings. Never in the authenticated product shell.
- **Do** use `rounded-2xl` (16px) for cards, `rounded-full` for primary buttons, `rounded-3xl` (24px) only for overlays and modals.
- **Do** establish dark-mode depth through tonal surface layering (`#181818` → `#1C1C1C` → `#222222` → `#2A2A2A`) — not shadows at rest.
- **Do** apply shadows only as a state response: `shadow-xl` on hover, `shadow-2xl` on elevated overlays.
- **Do** cap body line length at 65–75ch on prose surfaces (tutor chat, explanations, onboarding steps).
- **Do** use Framer Motion for meaningful transitions (panel enter/exit, modal, waveform). Provide `prefers-reduced-motion` fallbacks (crossfade or instant) for every animation.
- **Do** include all interactive states: default, hover, focus-visible, active, disabled, loading. Skeleton states (`animate-pulse bg-slate-200 dark:bg-slate-700`) for data-fetching; never centered spinners.
- **Do** keep button labels in Poppins, sentence case, `font-bold text-sm`. No uppercase except for Geist Mono data headers.
- **Do** use `pinboard-bg` only on the tutor chat surface and `grid-backdrop` only on the roadmap canvas.

### Don't:
- **Don't** use gamified edtech aesthetics: no cartoon mascots, no excessive badges, no cheerful celebration animations beyond the XP float-up. XP and streaks reinforce real learning — they are not the product.
- **Don't** use generic corporate SaaS dashboards with uniform blue-grey card grids where every metric has identical visual weight. NeuralNest's information has real hierarchy; express it.
- **Don't** use cluttered AI chatbot UIs with full-width message blocks and no visual structure. The tutor chat is a conversation, not a document.
- **Don't** use plain academic tool aesthetics (Quizlet/Anki-style clinical whiteness, no spatial character, no color). NeuralNest is a premium tool.
- **Don't** pair a 1px border AND a wide box-shadow (`blur > 16px`) on the same element in the same state. Border at rest; shadow on hover/elevated.
- **Don't** exceed `border-radius: 16px` on card elements. `24px+` reads as "insanely rounded" — use only on overlays and modals.
- **Don't** use gradient text (`background-clip: text` with a gradient fill) anywhere — including the wordmark. The wordmark uses Poppins `font-extrabold tracking-tight` in plain `text-[#333333] dark:text-white`.
- **Don't** use glassmorphism as decoration. `backdrop-blur` is sanctioned only on TopicPopupCard and the StudyMusicPlayer panel — surfaces that float above a canvas. Not on regular cards or sidebar panels.
- **Don't** use amber, emerald, rose, or hard-red outside their semantic mastery/state roles. These are a vocabulary, not a palette.
- **Don't** use `clamp()`-based fluid typography on product UI surfaces. Fixed `rem` sizing at defined breakpoints only; `clamp()` is for Instrument Serif landing display headings exclusively.
- **Don't** use `repeating-linear-gradient` stripe backgrounds or diagonal decorative stripes outside of `pinboard-bg` on the tutor chat surface. Never use hand-drawn SVG illustrations as filler.
- **Don't** add new top-level sections beyond the six spec sections. Motion, breakpoints, and layout rules fold into the existing sections.
