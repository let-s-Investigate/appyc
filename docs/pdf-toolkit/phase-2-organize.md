# Phase 2 — Organize Tools

Five tools, all pure-JS on top of existing services. No new dependencies. Estimated ~8 new files, ~3 modified.

Recommended build order: **Rotate → Page Numbers → Image to PDF → Organize Pages → Crop** (simplest to hardest; Organize and Crop share the page-grid/preview work of the earlier tools).

---

## 2.1 Rotate PDF

**Goal:** Rotate selected pages or all pages in 90° steps; save as new file (`Rotated_YYYY-MM-DD`).

**UI** (light screen, template: `split.tsx`): source picker → 3-column page thumbnail grid → tapping a page cycles its rotation 0→90→180→270 (badge shows current angle, thumbnail rotates visually) → "Rotate All 90°" quick action in the header row → bottom `PrimaryButton`.

**Service** `pdf-rotate.ts`: `rotatePdf(uri, rotations: Record<pageIndex, degrees>, title)` — load doc, for each page `page.setRotation(degrees(existing + delta))`, write.

**Files:** create `src/app/pdf/rotate.tsx`, `src/features/pdf/services/pdf-rotate.ts`. Modify `tools.tsx`, `_layout.tsx`, `FileMenuSheet.tsx` (add "Rotate PDF" item).

**Tasks:**
- [ ] Service: per-page rotation deltas on top of existing page rotation
- [ ] Screen: thumbnail grid with tap-to-cycle + per-page angle badge
- [ ] "Rotate all" batch action
- [ ] Wire hub + FileMenuSheet + route registration
- [ ] Verify: mixed-orientation output opens correctly in viewer; typecheck/lint

---

## 2.2 Page Numbers

**Goal:** Stamp page numbers on every page with position, size, and start-number options. Output `Numbered_YYYY-MM-DD`.

**UI** (light screen, template: `compress.tsx`): file card → options list:
- Position: 6 chips (bottom-center default; bottom-left/right, top-left/center/right)
- Size: Small / Medium / Large (radio rows, map to 9/11/14pt — Helvetica)
- Format: "1" / "1 of N" / "Page 1" (radio rows)
- Live preview: page-1 thumbnail with a positioned number overlay (like watermark preview)

**Service** `pdf-page-numbers.ts`: `addPageNumbers(uri, { position, fontSize, format, startAt }, title)` — embed Helvetica once, per page compute x/y from position + margins (24pt), `drawText`.

**Files:** create `src/app/pdf/page-numbers.tsx`, `services/pdf-page-numbers.ts`. Modify `tools.tsx`, `_layout.tsx`, `FileMenuSheet.tsx`.

**Tasks:**
- [ ] Service: position math for 6 anchors incl. text-width centering
- [ ] Screen: chips + radios + live overlay preview
- [ ] Handle rotated pages (draw within visible rect — test on a rotated doc from 2.1)
- [ ] Wire + verify

---

## 2.3 Image to PDF

**Goal:** Dedicated tool: pick gallery photos → reorder → page-size/margin options → PDF. (Today gallery import only exists via the scan editor.)

**UI** (light screen, template: `merge.tsx`): "Add Photos" (expo-image-picker, `allowsMultipleSelection`) → image cards with ✕ remove and ↑↓ move controls → name input → options row: Fit (contain) / Fill (cover), margin None / Small / Large → Create button.

**Service:** extend existing `images-to-pdf.ts` with `{ fit: 'contain'|'cover', marginPt: number }` params (currently hardcoded contain + 20px). Editor's save keeps current behavior.

**Files:** create `src/app/pdf/image-to-pdf.tsx`. Modify `services/images-to-pdf.ts` (options param with defaults), `tools.tsx`, `_layout.tsx`.

**Tasks:**
- [ ] Extend `imagesToPdf` with fit + margin options (backwards-compatible defaults)
- [ ] Screen: multi-pick, thumbnail list with remove/reorder, options
- [ ] EXIF orientation sanity check (portrait photos must not come out sideways)
- [ ] Wire + verify (output lands in Files with thumbnail + correct pageCount)

---

## 2.4 Organize Pages

**Goal:** Reorder, delete, and duplicate pages of an existing PDF via a thumbnail grid. Output `Organized_YYYY-MM-DD`.

**UI** (light screen): source picker → 3-column grid of page thumbnails (reuse `renderAllPages`), each cell numbered with its NEW position. Interactions (keep simple, no drag library):
- Tap cell → selection ring + action bar appears: Move Left / Move Right / Duplicate / Delete
- Deleted pages show dimmed with restore; guard: cannot delete all pages
- Reset button restores original order

**Service** `pdf-organize.ts`: `organizePdf(uri, newOrder: number[], title)` — `copyPages(source, newOrder)` into a fresh doc (handles reorder, delete = omitted index, duplicate = repeated index) — one function covers all three operations.

**Files:** create `src/app/pdf/organize.tsx`, `services/pdf-organize.ts`. Modify `tools.tsx`, `_layout.tsx`, `FileMenuSheet.tsx` (add "Organize Pages").

**Tasks:**
- [ ] Service: order-array copy (reorder/delete/duplicate in one)
- [ ] Grid with selection + Move/Duplicate/Delete/Restore action bar
- [ ] Disable save when order unchanged; confirm discard on back with edits
- [ ] Wire + verify on a 10+ page doc (order in viewer matches grid)
- [ ] Optional polish (only if quick): long-press drag via Reanimated — otherwise ship arrows

---

## 2.5 Crop PDF

**Goal:** Crop margins or a selected area; apply to one page or all. Output `Cropped_YYYY-MM-DD`.

**UI** (dark canvas, reuse pattern + handles from `editor.tsx`'s crop mode): page preview with the existing 8-handle PanResponder crop rect (extract that logic from editor.tsx into a shared `CropOverlay` component rather than duplicating) → page nav ‹ › → "Apply to all pages" switch → Save.

**Service** `pdf-crop.ts`: `cropPdf(uri, rect: {x,y,w,h} relative, pageIndexes | 'all', title)` — per page `page.setCropBox(x*w, pageH-(y+h)*pageH, w*pW, h*pH)` (also set MediaBox? No — CropBox only; viewers respect it, content preserved).
**Caveat to display in UI:** cropping hides content outside the box but does not delete it (that's Redact, Phase 3).

**Files:** create `src/app/pdf/crop.tsx`, `services/pdf-crop.ts`, `src/components/crop-overlay.tsx` (extracted from editor). Modify `editor.tsx` (use shared overlay), `tools.tsx`, `_layout.tsx`, `FileMenuSheet.tsx`.

**Tasks:**
- [ ] Extract `CropOverlay` from editor.tsx (keep editor behavior identical)
- [ ] Service: relative rect → CropBox coordinates (top-left → PDF bottom-left)
- [ ] Screen: preview + handles + page nav + apply-to-all
- [ ] Wire + verify: cropped output renders cropped in viewer AND external apps
- [ ] Regression: editor crop still works after extraction

---

## Phase 2 exit checklist

- [ ] All 5 tools reachable from Tools hub (no "SOON" badge left in Organize category)
- [ ] Rotate / Organize / Crop / Page Numbers also in FileMenuSheet
- [ ] `npx tsc --noEmit` + `npm run lint` — zero new errors
- [ ] Each tool tested end-to-end on device: happy path, cancelled picker, damaged-PDF error path, dark mode
- [ ] No regressions: scan flow, editor crop, Phase 1 tools
