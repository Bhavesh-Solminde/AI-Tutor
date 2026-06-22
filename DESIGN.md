---
name: NeuralNest AI
description: The AI learning operating system that thinks, adapts, and teaches
colors:
  primary: "#3B6BFF"
  primary-hover: "#2F5AE0"
  bg-dark: "#000000"
  bg-light: "#F9FAFB"
  surface-dark: "#121212"
  surface-light: "#FFFFFF"
  elevated-dark: "#1E1E1E"
  sidebar-dark: "#090909"
  sidebar-light: "#F3F4F6"
  border-dark: "#262626"
  border-light: "#E5E7EB"
  text-primary-dark: "#F3F4F6"
  text-primary-light: "#1F2937"
  text-muted-dark: "#9CA3AF"
  text-muted-light: "#6B7280"
  mastery-unstarted: "#9CA3AF"
  mastery-learning: "#FBBF24"
  mastery-mastered: "#10B981"
  semantic-error: "#EF4444"
  semantic-warning: "#F59E0B"
  semantic-info: "#3B82F6"
typography:
  display:
    fontFamily: "Inter, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Inter, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Inter, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.4
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
  mono:
    fontFamily: "JetBrains Mono, monospace"
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
    backgroundColor: "#222222"
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
---

# Design System: NeuralNest AI

## 1. Overview

**Creative North Star: "The Knowledge Graph"**

NeuralNest's visual language starts from one idea: the mental model IS the product. A directed graph of interconnected nodes — locked, learning, mastered — is not a feature. It is the primary metaphor of the entire interface. Every other surface (dashboard, tutor chat, quiz, exam rescue plan) is a different lens on the same underlying knowledge graph: progress made visible, dependencies respected, state changes earned.

This is a two-theme system built on near-black surfaces (dark, the primary experience) and a cool off-white (light, equally deliberate). The primary accent — Electric Blueprint `#3B6BFF` — is the connective tissue across all UI: it traces active navigation, marks CTA buttons, colors the progress ring, and anchors the brand wordmark. It earns its presence through restraint: it is used at ≤15% of any given surface, reserved strictly for primary actions, active states, and semantic connective indicators. The system uses Inter for all UI type (single-family product discipline) and JetBrains Mono exclusively for data — percentages, timestamps, topic IDs, durations.

Dark mode is the primary mode; the near-black `#000000` base and `#121212` surface layers create genuine depth without glass decoration. Surface elevation uses tonal layering: `#000000` → `#090909` → `#121212` → `#1E1E1E` is the complete ramp, with soft shadows appearing only on hover and elevated overlays. The system explicitly rejects: generic edtech/Duolingo gamification aesthetics, corporate SaaS dashboard blues with uniform card grids, cluttered AI chatbot UIs with no visual hierarchy, and plain academic tools with clinical whiteness and no spatial character.

**Key Characteristics:**
- One-family typographic discipline: Inter at multiple weights, JetBrains Mono for data only
- Near-black + tonal surfaces form a four-stop depth ramp without glass decoration
- `#3B6BFF` as systemic accent: navigation, CTA, progress — never decoration
- Three-state mastery vocabulary (gray / amber / emerald) is the semantic color system
- 8px base radius, scaling to 16px on cards and 24px on overlays — compact, never over-rounded
- Flat surfaces at rest; shadows appear only on hover (`shadow-sm → shadow-xl`) and elevated panels
- 150–250ms state transitions; motion is feedback, not choreography

## 2. Colors: The Blueprint Palette

A committed single-accent palette: one primary blue as connective tissue, near-black and near-white neutrals as the stage, and a three-state semantic vocabulary for the knowledge graph itself.

### Primary
- **Electric Blueprint** (`#3B6BFF`): The brand anchor. Used for: primary CTA buttons, active nav states, progress ring fill, focus rings, brand wordmark gradient origin. Never used decoratively. Hover deepens to `#2F5AE0` (`#2952CC` for active press). Shadow: `shadow-primary/25` under primary buttons.

### Neutral — Dark Theme
- **Void Black** (`#000000`): Page background in dark mode. The floor everything sits on.
- **Deep Sidebar** (`#090909`): Sidebar and secondary panel backgrounds — one step lifted from the page.
- **Surface Ink** (`#121212`): Primary card and surface background — the main content layer.
- **Elevated Ink** (`#1E1E1E`): Raised state: hover surfaces, modals, elevated cards.
- **Graphite Border** (`#262626`): All dividers, borders, and separator lines in dark mode.
- **Fog** (`#9CA3AF`): Muted text, placeholders, secondary labels, timestamps.
- **Snow** (`#F3F4F6`): Primary text on dark surfaces.

### Neutral — Light Theme
- **Cloud White** (`#F9FAFB`): Page background in light mode.
- **Ash** (`#F3F4F6`): Sidebar background.
- **Pure White** (`#FFFFFF`): Card and surface background.
- **Slate Border** (`#E5E7EB`): Borders and dividers.
- **Slate Ink** (`#1F2937`): Primary text.
- **Stone** (`#6B7280`): Muted text, secondary labels.

### Semantic — Knowledge Graph States
- **Mastered Emerald** (`#10B981`): Mastered topic nodes, progress bars at ≥80%, pass badges.
- **Learning Amber** (`#FBBF24`): In-progress nodes, pulsing ring animations, active quiz indicator.
- **Unstarted Gray** (`#9CA3AF`): Locked nodes, not-started states.
- **Error Red** (`#EF4444`): Wrong quiz answers, error states, live danger indicators.

### Named Rules
**The Connective Tissue Rule.** `#3B6BFF` is used on ≤15% of any screen surface. It connects: active navigation, primary CTAs, and the progress ring. It does not appear as a background fill, decorative border, or ambient glow. Every use must be answerable: "what action or state does this blue mark?"

**The Three-State Rule.** The mastery color triad (gray / amber / emerald) is a semantic system, not a decorative palette. These three colors appear ONLY on states they name: unstarted, learning, mastered. Never use amber as a "warm accent" in a non-mastery context.

## 3. Typography

**Display / Body / Label Font:** Inter (sans-serif, system fallback)
**Mono Font:** JetBrains Mono (monospace, data-only contexts)

**Character:** One-family discipline for product legibility. Inter at 800-weight carries display headings with authority; at 400-weight it reads cleanly at 14px body size. JetBrains Mono is reserved strictly for data: percentages, timestamps, topic durations, topic indices. The pairing is weight-contrast within a single humanist sans — never two geometric or two serif voices.

### Hierarchy
- **Display** (800, 36px / 2.25rem, line-height 1.1, tracking -0.02em): Page-level section headings, hero text on landing. Maximum in product UI. Never larger than 2.25rem in authenticated surfaces.
- **Headline** (700, 24px / 1.5rem, line-height 1.25, tracking -0.01em): Card section titles, major widget headings (e.g. "Topic Mastery", dashboard section labels).
- **Title** (700, 18px / 1.125rem, line-height 1.4): Component headings, sidebar section titles, popup card topic names.
- **Body** (400, 14px / 0.875rem, line-height 1.6): Primary reading text: chat messages, card descriptions, onboarding instructions. Cap at 65–75ch per line on prose surfaces.
- **Label** (600, 12px / 0.75rem, line-height 1.4): Button labels, nav item text, chip text, form field labels. Never uppercase except for mono-data headers with explicit tracking.
- **Mono** (JetBrains Mono 400, 12px / 0.75rem, line-height 1.5): Topic indices (`#01`, `#02`), percentage values, timestamps (`2h 45m`), table data columns. Uppercase in column headers only, with `tracking-wider`.

### Named Rules
**The Mono Gate Rule.** JetBrains Mono is used ONLY for quantitative data: numbers, durations, percentages, indices. It is not used for UI labels, descriptions, button text, or headings. If it can be read aloud as prose, it uses Inter.

**The Single-Family Rule.** No second display or serif typeface is introduced for any reason. Inter carries all hierarchy through weight and size. The visual contrast between Display (800) and Body (400) is sufficient.

## 4. Elevation

NeuralNest uses a hybrid elevation model: surfaces are flat at rest, with shadows emerging as a response to state (hover, elevation above the canvas, overlay). Depth is established primarily through tonal layering — each surface sits at a distinct stop on the dark ramp — so shadows are never needed to separate adjacent surfaces at rest. The four-stop dark ramp (`#000000` → `#090909` → `#121212` → `#1E1E1E`) is the architectural skeleton.

### Shadow Vocabulary

- **Resting surfaces**: no shadow. Cards, table rows, and nav items use only border (`1px solid #262626`) and background color for separation.
- **Hover lift** (`box-shadow: 0 8px 24px rgba(0,0,0,0.3)` / Tailwind `shadow-xl`): Applied to topic nodes on hover — `shadow-sm` → `shadow-xl` + `-translate-y-0.5`. The transition communicates interactivity, not decoration.
- **Overlay / Popup** (`box-shadow: 0 24px 64px rgba(0,0,0,0.5)` / Tailwind `shadow-2xl`): Applied to the TopicPopupCard, modals, and any panel detached from the main surface. Communicates true elevation above the canvas.
- **Button glow** (`box-shadow: 0 0 40px -10px rgba(59,107,255,0.6)`): Primary CTA buttons on the landing page only. Never on in-product CTAs (those use `shadow-md` max).
- **Mastery ring pulse**: amber `box-shadow: 0 0 10px–20px rgba(251,191,36,0.2–0.6)` on the learning node's pulsing ring overlay. Semantic, not decorative.

### Named Rules
**The Flat-at-Rest Rule.** No surface casts a shadow in its default state. Shadows are earned by interaction (hover), by elevation above the canvas (popup), or by semantic state (learning pulse). A shadow at rest signals to the user that an element is interactive — it must be.

**The One-Shadow Rule.** A component uses either a border OR a shadow — never both on the same element in the same state. At rest: border only. On hover or elevated: shadow replaces or overrides the border visually through `shadow-xl`. The ghost-card pattern (1px border + wide drop shadow simultaneously) is prohibited.

## 5. Components

NeuralNest's component vocabulary is refined and efficient: compact sizing, 8–16px radius, information-dense but never cramped. Components are meant to disappear into the task. The two signature components — TopicNode and TopicPopupCard — carry the spatial graph metaphor through their form.

### Buttons
**Compact, confident, pill-shaped for primary, gently rounded for secondary.**

- **Shape:** Primary CTAs use `border-radius: 9999px` (full pill). Secondary/ghost CTAs use `border-radius: 16px` (lg). Never `border-radius: 24px+` on rectangles.
- **Primary** (`bg-cta #3B6BFF`, white text, `px-6 py-2`, `rounded-full`, `font-bold text-sm`): Used for the single most important action per view. TopBar's "Ask Doubt", Sidebar's "New Session", PopupCard's "Start Learning". Shadow: `shadow-md`. Transition: `duration-300`.
- **Hover / Focus:** Background deepens to `#2F5AE0` or `#2952CC`. No scale transform on in-product buttons.
- **Ghost / Outline** (`border border-[#3B6BFF]`, transparent bg, `text-[#3B6BFF]`, `rounded-2xl`): Secondary action, e.g. "Test My Skills" in TopicPopupCard. Hover: `bg-primary/5`.
- **Icon-only**: `p-1 rounded-full`, `text-[#3B6BFF]`, hover: `opacity-80`. Used for PlayCircle in tables, X dismiss buttons.

### Chips / Status Badges
**Semantic-only: the mastery triad on white/10% alpha backgrounds.**

- **Mastered:** `bg-emerald-500/10 text-emerald-500 border-emerald-500/20 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider`
- **Learning / In Progress:** `bg-amber-500/10 text-amber-500` — same shape.
- **Locked / Not Started:** `bg-slate-100/80 dark:bg-slate-800/80 text-slate-400` — same shape.
- **Difficulty pills (table):** `bg-emerald-500/10 text-emerald-500` (easy), `bg-amber-500/10 text-amber-500` (medium), `bg-red-500/10 text-red-500` (hard). `rounded-full px-3 py-1 text-[10px] font-bold capitalize`.
- **PYQ Hot Badge:** `bg-rose-500 text-white rounded-full px-2 py-0.5 text-[9px] font-bold border-2 border-white dark:border-slate-900`. Positioned absolutely at `-top-2 -right-2`.

### Cards / Containers
**Gently curved, tonal-layered, minimal border, no shadow at rest.**

- **Corner Style:** `border-radius: 16px` (rounded-2xl) on standard cards and widgets. `border-radius: 24px` (rounded-3xl) on overlays (PopupCard, modals).
- **Background:** `bg-white dark:bg-surface-dark (#121212)` for primary cards. `bg-slate-50/50 dark:bg-elevated-dark/20` for sub-sections and inset panels.
- **Border:** `1px solid #E5E7EB` light / `1px solid #262626` dark. Always present at rest; provides separation without shadow.
- **Shadow Strategy:** None at rest (see Elevation). `shadow-sm` on stat widgets for a subtle lift. `shadow-2xl` on true overlays.
- **Internal Padding:** `p-6` (24px) standard; `p-4` (16px) on compact widgets and table cells; `p-8` (32px) on landing feature cards.
- **Nested cards:** Prohibited. Use `bg-slate-50/50 dark:bg-elevated-dark/20` inset backgrounds for sub-sections within a card.

### Inputs / Fields
**Stroke-based, gently rounded, focus shifts the border to primary blue.**

- **Style:** `bg-slate-50 dark:bg-elevated-dark`, `border border-border-light dark:border-border-dark`, `rounded-xl` (12px). Body text `text-sm`. Placeholder: `text-slate-400 dark:text-text-muted-dark`.
- **Focus:** `border-primary dark:border-primary`, no glow or outer ring. `bg-white dark:bg-elevated-dark` on focus for light mode.
- **Transition:** `transition-all duration-300` on all input state changes.
- **Disabled:** `opacity-50 cursor-not-allowed`.
- **Error:** `border-red-500` with `text-red-500` helper text below.

### Navigation
**Sidebar: 210px fixed, dark `#090909` / light `#F3F4F6`. Sticky top-0.**

- **Nav items:** `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium`. Icon: 20×20px Lucide.
- **Default:** `text-text-muted`, no background.
- **Hover:** `bg-slate-100 dark:bg-surface-dark/50`, text shifts to `text-primary-light dark:text-white`.
- **Active:** `bg-nav-active-light (#EFF6FF) dark:bg-nav-active-dark (#222222)`, `text-primary`, `border border-primary/10 dark:border-border-dark`, `shadow-sm`.
- **TopBar:** 64px fixed, `bg-surface-light dark:bg-surface-dark (#121212)`, `border-b`. Contains: primary CTA pill left, ThemeToggle + user avatar right.
- **Wordmark:** `NEURALNEST` in `font-extrabold tracking-tight`, gradient `from-primary to-purple-600 dark:from-accent dark:to-purple-400 bg-clip-text text-transparent`.

### Topic Node (Signature Component)
**The graph's unit. 208px wide, `rounded-2xl`, three visual states.**

The TopicNode is the spatial language of the product: a compact card (`w-52 rounded-2xl border`) that lives in the React Flow canvas. Its three states are semantically color-coded with no ambiguity:

- **Unstarted:** `bg-white border-slate-200/70 dark:bg-slate-900/60 dark:border-slate-700/50`. Gray icon background (`bg-slate-100 dark:bg-slate-800`). Lock icon.
- **Learning:** `bg-amber-500/10 border-amber-500/30`. Amber icon background. Sparkles icon (animate-pulse). Pulsing `ring-2 ring-amber-400/40` overlay.
- **Mastered:** `bg-emerald-500/10 border-emerald-500/30`. Emerald icon background. Check icon.

Hover on all states: `shadow-xl -translate-y-0.5` (transition-all duration-300). Contains: mono index (`#01`), icon badge, topic name (bold, line-clamp-2), difficulty dot + time row, status pill, optional mastery bar (1px height, rounded-full).

### Topic Popup Card (Signature Component)
**Glass overlay, absolutely positioned, 380px max-width, backdrop-blur.**

`bg-white/95 dark:bg-surface-dark/95 backdrop-blur-md border rounded-3xl shadow-2xl`. Internal layout: title + status badge + close X → 3-column stat grid (Time / Level / Mastery) in `rounded-2xl` inset cells → two full-width CTAs (primary pill + ghost outline). The grid cells use `bg-slate-50/50 dark:bg-elevated-dark/20 border rounded-2xl` — a tonal inset, never a nested shadow card.

## 6. Do's and Don'ts

### Do:
- **Do** use `#3B6BFF` only on primary CTAs, active nav states, progress indicators, and focus rings. Its scarcity is the point.
- **Do** use the three-state mastery colors (gray / amber / emerald) exclusively for their named semantic states — locked, learning, mastered.
- **Do** use JetBrains Mono only for quantitative data: numbers, percentages, durations, indices.
- **Do** use `rounded-2xl` (16px) for cards and `rounded-full` for primary buttons. `rounded-3xl` (24px) only for overlays and modals.
- **Do** establish depth through tonal surface layering (`#000000` → `#090909` → `#121212` → `#1E1E1E`) — not shadows at rest.
- **Do** apply shadows only as a state response: `shadow-xl` on hover, `shadow-2xl` on elevated overlays.
- **Do** cap body line length at 65–75ch on prose surfaces (tutor chat, explanations, onboarding steps).
- **Do** provide `prefers-reduced-motion` fallbacks for every animation: crossfade or instant transition.
- **Do** keep button labels in Inter, sentence case, and `font-bold text-sm`. No uppercase label text except mono data headers.
- **Do** include all interactive states: default, hover, focus-visible, active, disabled, loading. Skeleton states for data-fetching, never spinners in the center of content areas.

### Don't:
- **Don't** use gamified edtech aesthetics: no cartoon mascots, no excessive badges, no cheerful celebration animations beyond the XP float-up. XP and streaks reinforce real learning — they are not the product.
- **Don't** use generic corporate SaaS dashboards with uniform blue-grey card grids where every metric has identical visual weight. NeuralNest's information has real hierarchy; express it.
- **Don't** use cluttered AI chatbot UIs with full-width message blocks and no visual structure. The tutor chat is a conversation, not a document.
- **Don't** use plain academic tool aesthetics (Quizlet/Anki-style clinical whiteness, no spatial character, no color). NeuralNest is a premium tool.
- **Don't** pair a 1px border AND a wide box-shadow (`blur > 16px`) on the same element simultaneously. Pick one: border at rest, shadow on hover.
- **Don't** exceed `border-radius: 16px` on card elements. `24px+` reads as "insanely rounded" — use only on overlays and modals.
- **Don't** use gradient text (`background-clip: text` with a gradient fill) in the product UI. The NEURALNEST wordmark in the sidebar is the only exception.
- **Don't** use glassmorphism as decoration. `backdrop-blur` is used only on the navbar and TopicPopupCard — surfaces that float above a canvas or page content. Not on regular cards.
- **Don't** use amber, emerald, or red outside their semantic mastery/state roles. These are a vocabulary, not a general palette.
- **Don't** add new top-level sections beyond the six spec sections. Motion, breakpoints, and layout rules fold into this document's existing sections.
- **Don't** use `clamp()`-based fluid typography on product UI surfaces. Fixed `rem` sizing at defined breakpoints only; fluid type is for the landing page exclusively.
- **Don't** use `repeating-linear-gradient` stripe backgrounds, diagonal decorative stripes, or hand-drawn SVG illustrations as filler.
