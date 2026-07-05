# AGENTS.md

You are an expert React Native + Expo engineer helping build a production-quality document scanning application.

You write clean, simple, maintainable code.

The goal is to build a feature-rich, CamScanner-style mobile scanner app based on the provided design references while maintaining excellent architecture, performance, and code quality.

---

# Project Overview

We are building a CamScanner-style document scanner app.

A mobile-first scanning application that captures, enhances, organizes, signs, and exports documents as PDFs and images.

The app must include all core CamScanner-style capabilities:

* Document Scanning (auto edge detection, multi-page)
* QR Code & Barcode Scanner
* ID Card Scan
* Book Scan
* Business Card Scan
* Crop, Rotate, Resize
* Filters & Image Enhancement (auto, magic color, grayscale, black & white)
* Add Watermark
* Digital Signature / eSign PDF
* Merge PDF
* Split PDF
* Compress PDF
* Protect PDF (password)
* Export (Word, Excel, PowerPoint, images, text)
* Recent Files management (rename, move to folder, delete)
* Share (Link, PDF, Word, JPG, PNG)
* All Tools hub
* Future scanning-related utilities

The application should feel polished, fast, native, and production-ready.

---

# Tech Stack

Use:

* Expo
* React Native
* TypeScript
* Expo Router
* NativeWind
* AsyncStorage

Do not introduce additional major libraries unless approved.

---

# Development Philosophy

Build incrementally.

For every task:

1. Understand the request.
2. Check this file first.
3. Keep implementation simple.
4. Avoid overengineering.
5. Prefer readability over abstraction.
6. Build the smallest working version first.
7. Refactor only when necessary.
8. Keep code teachable and maintainable.

---

# Architecture

Use this structure:

app/
components/
features/
hooks/
store/
constants/
types/
assets/
utils/
lib/

---

# Route Rules

app/

Contains routes only.

Screens should:

* compose components
* use hooks
* use stores

Screens should never contain large business logic.

Move business logic into:

* hooks
* services
* feature modules

---

# Feature Rules

Every major tool gets its own feature folder.

Example:

features/
scanner/
qr-scanner/
watermark/
signature/
merge-pdf/
split-pdf/
compress-pdf/
protect-pdf/
export/
files/

Feature folders may contain:

* components
* hooks
* services
* utils
* types

Keep tools isolated.

Do not create giant shared feature files.

---

# Component Rules

Create reusable components only when:

* used multiple times
* improves readability
* represents a clear UI concept

Examples:

* PrimaryButton
* ToolCard
* SearchInput
* PageHeader
* EmptyState
* Loader
* SectionHeader
* FileCard

Do not create tiny components prematurely.

Avoid component abstraction for one-off use cases.

---

# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

---

# UI Implementation Rules

CRITICAL

When a design reference is provided:

Replicate it exactly.

Match:

* spacing
* typography
* hierarchy
* colors
* shadows
* radius
* sizing
* alignment
* interactions

Do not approximate.

Do not redesign.

Do not simplify unless instructed.

Pixel-perfect implementation is required.

---

# Design System Enforcement Rules

CRITICAL

design.json is the single source of truth.

Never invent visual values.

Do NOT invent:

* font sizes
* font weights
* line heights
* spacing values
* padding values
* margin values
* border radius
* card heights
* button heights
* button widths
* icon sizes
* shadows

Use only design system tokens.

---

# Typography Rules

Typography must come from design.json.

Create:

constants/typography.ts

Examples:

typography.h1
typography.h2
typography.h3
typography.h4
typography.body

Never hardcode font sizes.

❌ Bad

fontSize: 17

className="text-[17px]"

❌ Bad

fontSize: 23

className="text-[23px]"

✅ Good

typography.body

typography.h3

Typography must use:

* Inter
* weights from design system
* line heights from design system

---

# Spacing Rules

Create:

constants/spacing.ts

Use only spacing tokens.

Examples:

spacing.xs
spacing.sm
spacing.md
spacing.lg
spacing.xl

Never invent spacing values.

❌ Bad

gap-[19px]

m-[21px]

p-[13px]

✅ Good

spacing.sm

spacing.md

spacing.lg

---

# Card Rules

Create:

constants/cards.ts

Store:

* radius
* padding
* border
* shadow

All cards must use shared card tokens.

Do not create custom card dimensions per screen.

Every ToolCard and FileCard should feel identical throughout the application.

---

# Button Rules

Buttons must strictly follow design tokens.

PrimaryButton:

* radius
* padding
* height
* width
* font size
* font weight

must come from design system.

Never override button dimensions per screen.

---

# Layout Rules

Avoid arbitrary layouts.

Create layout primitives:

components/layout/

Examples:

* Screen
* Container
* Section
* Row
* Column

All spacing must come from spacing tokens.

Do not use random flex gaps.

---

# Flexbox Rules

Use flexbox intentionally.

Avoid:

* nested unnecessary Views
* random flex values
* arbitrary width percentages

Prefer:

* flex-1
* justify-between
* items-center
* gap from design tokens

Every layout should be predictable.

---

# Responsive Rules

Mobile-first only.

Design references are the source of truth.

Maintain:

* card proportions
* spacing hierarchy
* typography hierarchy
* touch targets

Do not redesign for tablet.

Do not redesign for desktop.

---

# Keyboard Handling Rules

CRITICAL

The keyboard must never hide important content.

For screens containing inputs:

Use:

KeyboardAvoidingView

plus

ScrollView

when required.

Requirements:

* focused input always visible
* action buttons remain visible
* content scrolls automatically
* lower fields are never hidden

Keyboard overlap is considered a bug.

---

# Safe Area Rules

Every screen must respect:

* notches
* dynamic island
* status bar
* home indicator

Interactive content must remain inside safe areas.

Never place buttons in unsafe regions.

---

# Touch Target Rules

Minimum:

48x48

Preferred:

52x52+

Small icons must use larger touch containers.

Accessibility takes priority.

---

# NativeWind Rules

Use NativeWind for styling.

Prefer utility classes.

Avoid StyleSheet unless NativeWind cannot support the requirement.

Before writing styling code:

1. Check NativeWind version.
2. Follow installed version conventions.
3. Do not upgrade NativeWind without approval.

---

# Style Exceptions

Use StyleSheet only for:

* SafeAreaView styles
* Animated values
* Platform-specific styles
* Dynamic runtime values
* Native-only props

Otherwise use NativeWind.

---

# Animation Rules

When the user requests an animation:

1. Search the relevant animation on https://www.reacticx.com/docs/components/
2. Pick the component that matches the requested interaction.
3. Adapt it to the project's design tokens (spacing, radius, sizing, timing).
4. Keep animations smooth, native, and performant.

Do not invent custom animations when a matching Reacticx component already exists.

Use animations only when requested or when they clearly improve usability.

---

# Skill Rules

Whenever required, use the skills located in:

.agents/skill/

Before building or solving a task:

1. Check .agents/skill/ for a relevant skill.
2. If a matching skill exists, use it.
3. Follow the skill's instructions exactly.
4. Do not reinvent logic a skill already provides.

Prefer existing skills over custom one-off implementations.

---

# Design System Rules

Create centralized design tokens.

constants/

Examples:

* colors.ts
* spacing.ts
* typography.ts
* theme.ts
* cards.ts

Never hardcode repeated visual values.

---

# Image Rules

Use centralized image imports.

Create:

constants/images.ts

All images must be imported and exported through this file.

Never import image assets directly throughout the application.

---

# State Management

Use Zustand.

Persist with AsyncStorage when needed.

Examples:

* Recent Files
* Folders
* Scan History
* Preferences
* Saved Signatures

Use local component state for temporary UI state.

---

# TypeScript Rules

Use strict TypeScript.

Avoid:

* any
* unnecessary assertions
* unknown type hacks

Prefer explicit types.

Create types before implementing features.

---

# Utility Development Rules

When building a tool:

1. Understand the reference design behavior.
2. Replicate functionality exactly.
3. Keep feature isolated.
4. Reuse components.
5. Create types first.
6. Keep logic testable.
7. Ensure mobile usability.

Do not modify existing tools unless required.

---

# Performance Rules

Avoid unnecessary re-renders.

Use:

* memo
* useMemo
* useCallback

Only when justified.

Optimize large lists.

Lazy-load heavy screens.

Avoid premature optimization.

---

# Consistency Rules

A component created once must look identical everywhere.

Examples:

* ToolCard
* FileCard
* SearchBar
* PrimaryButton
* SectionHeader

Do not restyle identical components across screens.

Create variants only when approved.

---

# Accessibility

Ensure:

* readable typography
* proper labels
* screen reader support
* large touch targets
* proper contrast

Accessibility is mandatory.

---

# Validation Checklist

Before finishing any task verify:

✓ No TypeScript errors

✓ No lint errors

✓ Typography matches design system

✓ Spacing matches design system

✓ Card dimensions match design system

✓ Button dimensions match design system

✓ Keyboard does not hide content

✓ Safe areas respected

✓ Touch targets accessible

✓ NativeWind styles working

✓ Imports cleaned up

✓ Feature works end-to-end

Run:

npm run lint

npm run typecheck

Fix issues before completion.

---

# Communication Rules

When completing work provide:

1. Files created
2. Files modified
3. What changed
4. How to test

Be concise.

Do not provide unnecessary explanations.

---

# Important Constraints

Do not:

* Rewrite unrelated files
* Change architecture without reason
* Introduce new dependencies without approval
* Create unnecessary abstractions
* Invent visual values not found in design system

Always prefer simplicity.

---

# Final Rule

Before implementing any feature:

1. Read this file.
2. Follow it strictly.
3. Read design.json.
4. Use design tokens only.
5. Match provided designs exactly.
6. Keep code clean.
7. Build production-quality implementations.
8. Never invent UI values.
