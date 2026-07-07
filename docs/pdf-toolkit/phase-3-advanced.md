# Phase 3 — Advanced Tools

Seven tools. All dependencies already installed (ML Kit for OCR is in the build). Feasibility varies — each tool below states its honest limits up front; those limits should be communicated in the UI, not hidden.

Recommended build order: **Unlock → Repair → OCR → Edit/Annotate → Forms → Redact → Compare** (rising complexity; Redact/Compare reuse OCR + rasterize plumbing).

---

## 3.1 Unlock PDF

**Goal:** Remove a known password. Output `Unlocked_YYYY-MM-DD`.

**UI** (light, template: `protect.tsx`): file card → password input (show/hide) → Unlock button. Wrong password → inline error "Incorrect password", not a generic alert.

**Service** `pdf-unlock.ts`: `unlockPdf(uri, password, title)` — `PDFDocument.load(base64, { password })` (@cantoo fork supports decryption), then plain write (no `encrypt()` call) → unencrypted output.
**Limit:** only PDFs whose password the user knows; no cracking. Encryption algorithms unsupported by the fork → clear error.

**Files:** create `src/app/pdf/unlock.tsx`, `services/pdf-unlock.ts`. Modify `tools.tsx`, `_layout.tsx`, `FileMenuSheet.tsx`.

**Tasks:**
- [ ] Service: load-with-password → save plain; map wrong-password error distinctly from parse errors
- [ ] Screen with inline wrong-password state (keep KeyboardAvoidingView pattern)
- [ ] Round-trip test: Protect (Phase 1) → Unlock → opens without password
- [ ] Wire + verify

---

## 3.2 Repair PDF

**Goal:** Best-effort recovery of a damaged PDF. Output `Repaired_YYYY-MM-DD`.

**UI** (light, template: `compress.tsx` minus options): file card → Repair button → success shows "Recovered N pages".

**Service** `pdf-repair.ts`: two strategies in order:
1. Lenient re-save: `PDFDocument.load(base64, { ignoreEncryption: true, throwOnInvalidObject: false, updateMetadata: false })` → write (fixes xref/trailer damage).
2. If load fails entirely: rasterize fallback — `renderAllPages` (the OS renderer is often more tolerant) → rebuild as image PDF via compress pipeline. Mark result "recovered as images".
**Limit:** truly unreadable files fail with an honest "could not be recovered" state.

**Files:** create `src/app/pdf/repair.tsx`, `services/pdf-repair.ts`. Modify `tools.tsx`, `_layout.tsx`, `FileMenuSheet.tsx`.

**Tasks:**
- [ ] Strategy 1: lenient parse + re-save
- [ ] Strategy 2: rasterize fallback (reuse compress internals), flag which strategy succeeded
- [ ] Craft test fixtures: truncated file, corrupted xref
- [ ] Wire + verify

---

## 3.3 OCR PDF

**Goal:** Make scanned PDFs searchable — recognize text on-device (ML Kit) and embed an invisible text layer. Output `OCR_YYYY-MM-DD`.

**UI** (light): file card → language note (ML Kit Latin default; CJK etc. need the specific recognizer variants — Phase 3 ships Latin only, say so in UI) → Run OCR → progress with per-page counter ("Page 3 of 10") → success shows "N words recognized".

**Service** `pdf-ocr.ts`:
1. `renderAllPages(uri, 100)` high quality
2. Per page: `TextRecognition.recognize(imageUri)` (`@react-native-ml-kit/text-recognition`) → blocks/lines with bounding boxes
3. Rebuild PDF: original page image (or original page via copyPages) + per line `drawText` with `opacity: 0`, positioned/scaled from the bounding box (map image px → page pt)
4. Store recognized plain text in file metadata (`updateFile` — extend `ScannedFile` with `ocrText?: string`) so Search can match content later.

**Limit:** output page becomes image+text (same caveat as compress) when built from renders; text positioning is approximate (good enough for select/search).

**Files:** create `src/app/pdf/ocr.tsx`, `services/pdf-ocr.ts`. Modify `types` (ocrText), `search.tsx` (optional: match ocrText), `tools.tsx`, `_layout.tsx`, `FileMenuSheet.tsx`.

**Tasks:**
- [ ] Service: render → recognize → invisible text layer with coordinate mapping
- [ ] Per-page progress reporting (callback from service → UI counter)
- [ ] Save ocrText to store; extend search to match it (flagged "found in content")
- [ ] Verify: text selectable/searchable in an external PDF viewer
- [ ] Wire + verify (device-only feature — ML Kit doesn't run in simulator reliably)

---

## 3.4 Edit PDF (Annotate)

**Goal:** Add text boxes, images, shapes (rect/ellipse/line), and freehand ink on top of pages; move/resize; flatten into the PDF. Output `Edited_YYYY-MM-DD`. (True editing of existing content is out of scope — this is overlay annotation, standard for mobile.)

**UI** (dark canvas — biggest screen of the phase, patterns from `sign.tsx`):
- Page view with page nav; toolbar: Text / Image / Shape / Draw / Color / Size
- Each added element = draggable box (reuse sign.tsx drag pattern, add corner resize handle)
- Elements stored per page in local state: `{ type, pageIndex, rect, payload, color, strokeWidth }`
- Ink tool reuses the sign.tsx SVG stroke capture, scoped to the page view

**Service** `pdf-annotate.ts`: `annotatePdf(uri, elements[], title)` — per element map relative rect → page pts: text → `drawText` (fit-size like sign), image → embedPng/Jpg + `drawImage`, rect/ellipse/line → `drawRectangle`/`drawEllipse`/`drawLine`, ink → `drawSvgPath` scaled.

**Files:** create `src/app/pdf/edit.tsx`, `services/pdf-annotate.ts`, `src/features/pdf/components/AnnotationBox.tsx` (draggable/resizable box shared with a later sign.tsx refactor). Modify `tools.tsx`, `_layout.tsx`, `FileMenuSheet.tsx`.

**Tasks:**
- [ ] AnnotationBox: drag + one-corner resize, selected/unselected states
- [ ] Text tool (inline TextInput → box), color palette (design tokens), size chips
- [ ] Shape + line tools; Draw tool (SVG capture per page)
- [ ] Image insert (gallery picker)
- [ ] Service: flatten all element types with correct coordinate mapping
- [ ] Delete element, undo last add, discard-confirm on back
- [ ] Wire + verify each element type lands where placed (round-trip check in viewer)

---

## 3.5 PDF Forms

**Goal:** Detect and fill AcroForm fields; create basic fields (text/checkbox) on any PDF. Output `Form_YYYY-MM-DD`.

**UI** (light):
- **Fill mode** (default when doc has fields): list detected fields grouped by page — TextInput per text field, Switch per checkbox, radio-row per radio/dropdown → "Save Filled" (option: flatten = make read-only)
- **Create mode** (docs without fields): page preview → tap to place Text Field / Checkbox boxes (reuse AnnotationBox) → saves a fillable PDF

**Service** `pdf-forms.ts`: `getFormFields(uri)` (name/type/value/page via `doc.getForm()`), `fillForm(uri, values, { flatten }, title)` (`getTextField().setText()` etc., `form.flatten()` when asked), `createFields(uri, defs[], title)` (`form.createTextField` / `createCheckBox` + `addToPage` with rect).

**Limit:** signatures/JS-driven fields not supported; dropdown creation deferred (fill-only for dropdowns).

**Files:** create `src/app/pdf/forms.tsx`, `services/pdf-forms.ts`. Modify `tools.tsx`, `_layout.tsx`, `FileMenuSheet.tsx`.

**Tasks:**
- [ ] Service: enumerate fields (map pdf-lib field classes → simple descriptors)
- [ ] Fill UI with keyboard handling (long forms scroll, focused input visible)
- [ ] Flatten option
- [ ] Create mode: place text/checkbox fields (reuse AnnotationBox)
- [ ] Verify with a real government/typical AcroForm PDF + a created-then-filled round trip
- [ ] Wire + verify

---

## 3.6 Redact PDF

**Goal:** TRUE redaction — content under the marked areas is destroyed, not covered. Output `Redacted_YYYY-MM-DD`.

**Approach (honest tradeoff, stated in UI):** pages containing redactions are **rasterized**: render page → draw black boxes into the bitmap → rebuilt page is a flat image, so original text/graphics are unrecoverable. Untouched pages are copied as-is (keep text). This is the only robust on-device method without a content-stream editor.

**UI** (dark canvas, template: crop/sign): page preview → drag to draw black rectangles (multiple per page) → page nav shows redaction-count badges → Redact button with confirm dialog ("Permanent. Redacted pages become images.").

**Service** `pdf-redact.ts`: `redactPdf(uri, rects: {pageIndex, rect}[], title)` — group rects by page; for touched pages render at high quality → composite black rects (no RN canvas: draw via pdf-lib instead — embed rendered JPEG, then `drawRectangle` black on top, since the flatten happens by rasterizing the *source*; the black box + image page is then safe because the underlying vector content was discarded with the original page) → untouched pages `copyPages`.

**Files:** create `src/app/pdf/redact.tsx`, `services/pdf-redact.ts`. Modify `tools.tsx`, `_layout.tsx`, `FileMenuSheet.tsx`.

**Tasks:**
- [ ] Rect-drawing overlay (drag to create, tap to delete, multi-rect per page)
- [ ] Service: rasterize-touched / copy-untouched hybrid rebuild
- [ ] Confirm dialog with permanence warning
- [ ] Verify: text under redaction NOT extractable (copy/paste + OCR test on output)
- [ ] Wire + verify

---

## 3.7 Compare PDF

**Goal:** Side-by-side comparison of two PDFs with synchronized paging. (Visual compare; no text diffing — pdf-lib can't extract text; note in UI.)

**UI** (dark viewer variant): pick Document A and B (two SelectedFileCards + source picker) → split view: two page images stacked (portrait) with synced page nav ‹ x/y ›, and an **Overlay mode** toggle: B rendered at 50% opacity on top of A (misalignments jump out). Swap A/B button. No file output — this is a viewer, no Save/Success flow.

**Service:** none new — `renderAllPages` for both docs.

**Files:** create `src/app/pdf/compare.tsx`. Modify `tools.tsx`, `_layout.tsx` (not in FileMenuSheet — needs two files; optional: menu entry preselects file A).

**Tasks:**
- [ ] Dual source selection UI
- [ ] Split view + synced page navigation (handle different page counts)
- [ ] Overlay mode (opacity stack)
- [ ] Wire + verify with two versions of the same doc

---

## Phase 3 exit checklist

- [ ] All Security + Optimize + Edit hub categories fully wired (zero "SOON" badges except backlog items)
- [ ] Protect→Unlock round trip; Redact output resists text extraction; OCR output searchable externally
- [ ] `npx tsc --noEmit` + `npm run lint` — zero new errors
- [ ] Device test pass incl. dark/light, keyboard, error paths
- [ ] No regressions across Phases 1–2

---

## Phase 4 backlog (not planned — needs separate decisions)

- **QR & Barcode scan** — needs `expo-camera` barcode scanning UI (dep already installed, screen not designed)
- **ID Card / Book / Business Card scan modes** — scanner-plugin presets + custom layouts (design references needed)
- **AI Summarizer / Translate** — skipped by decision (no backend/provider); revisit when one exists
- **Share Link** — requires a backend/upload service; excluded from offline-first scope
