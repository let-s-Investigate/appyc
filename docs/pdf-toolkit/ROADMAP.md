# ProScan PDF Toolkit — Roadmap

Master plan for the iLovePDF-style toolkit. Offline-first, on-device processing.
Reference designs: `materials/upcoming/`. Spec: `dump/1.txt`.

## Status

| Phase | Scope | Status |
|---|---|---|
| **1 — Core + Security** | Infrastructure, Merge, Split, Compress, Watermark, Sign, Protect, Viewer, File menus | ✅ Done |
| **2 — Organize** | Organize Pages, Rotate PDF, Page Numbers, Crop PDF, Image to PDF | 📋 Planned → `phase-2-organize.md` |
| **3 — Advanced** | Unlock, Repair, OCR, Edit/Annotate, PDF Forms, Redact, Compare | 📋 Planned → `phase-3-advanced.md` |
| **4 — Backlog** | QR/Barcode scan, ID Card scan, Book scan, Business Card scan, AI tools | ⏸ Not planned (AI skipped by decision) |

## Foundations already in place (Phase 1) — reuse, do not rebuild

- **PDF engine**: `src/features/pdf/services/` — `pdf-io.ts` (load/write via `@cantoo/pdf-lib` + base64), `pdf-thumbnails.ts` (page → image via `react-native-pdf-thumbnail`), `images-to-pdf.ts` (expo-print pipeline)
- **Tool plumbing**: `use-pdf-source.ts` (Files / Scan / Device source picker), `use-save-output.ts` (thumbnail + register in filesStore), `utils/naming.ts` (`Prefix_YYYY-MM-DD` naming, `formatBytes`)
- **Tool UI kit**: `SourcePickerSheet`, `SelectedFileCard`, `ToolProgress`, `ToolSuccess` (Open/Share/Done), `RadioOptionRow`, `ToolHeader`, `PrimaryButton`, `EmptyState`, `BottomSheetMenu`
- **Screens/patterns**: light tool screens use `ScreenContainer` + `ToolHeader` + bottom `PrimaryButton` (see `src/app/pdf/compress.tsx` as template); dark canvas screens follow `src/app/pdf/watermark.tsx` / `sign.tsx`; every tool accepts `?fileId=` for preselection from `FileMenuSheet`
- **Persistence**: filesStore persisted via AsyncStorage; files carry `sizeBytes`, `pageCount`
- **Native deps**: ALL phases' native modules are already installed and in the dev-client build (`@cantoo/pdf-lib`, `react-native-pdf-thumbnail` (patched — see `patches/`), `react-native-svg`, `expo-image-manipulator`, `@react-native-ml-kit/text-recognition`, async-storage, get-random-values). **No new dependencies or EAS rebuilds are expected for Phases 2–3.**

## Conventions every new tool must follow

1. Route at `src/app/pdf/<tool>.tsx`, registered in `src/app/_layout.tsx`, pushed with the global `slide_from_right`.
2. Wired in three places: Tools hub (`src/app/tools.tsx` — replace its `comingSoon: true` entry), `FileMenuSheet` (if it operates on one file), and Home `ToolGrid` only if a design exists.
3. Service logic in `src/features/pdf/services/pdf-<tool>.ts` — pure async function, no store/UI imports, throws on failure.
4. States: source empty state → options → `ToolProgress` → `ToolSuccess` / `Alert` on error ("may be damaged or password protected").
5. Output naming via `buildOutputTitle('<Prefix>')`, saved via `useSaveOutput`.
6. Validation before done: `npx tsc --noEmit` clean, `npm run lint` no new errors, light+dark checked, keyboard never covers inputs, 48px+ touch targets.
