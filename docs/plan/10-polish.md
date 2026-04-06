# Plan 10: Polish & Export

**Beads:** `controller-9xu`
**Phase:** 5
**Dependencies:** Plans 06-09 (all views)
**Plan overview:** [00-overview.md](00-overview.md)

---

## Goal

Final polish: print-friendly export, keyboard navigation between views, and URL-based deep links for sharing specific views.

---

## 10a: Quick Reference Cards (Print Export)

Compact, print-optimized cards for one layer or one gameplay mode.

- Reuses data from Mode Cheat Sheet and Layer Browser
- Print-specific CSS layout (`@media print`)
- Export as image (html2canvas) or PDF
- One-page format optimized for desk reference

### Component

```
src/components/QuickReferenceCard/
  QuickReferenceCard.tsx     - Print-optimized layout
  ExportButton.tsx           - PDF/Image export trigger
```

---

## 10b: Keyboard Shortcut Navigation

Navigate between views and interact without mouse.

### Shortcuts

| Key | Action |
|-----|--------|
| `1-5` | Switch between main views |
| `Tab` | Navigate between buttons (Controller Visual) |
| `Enter` | Select button / expand detail |
| `Escape` | Close detail panel / clear search |
| `/` | Focus search input |
| `[` / `]` | Previous / next layer |

---

## 10c: URL-Based State (Deep Links)

Encode view state in the URL so users can share links to specific views.

```
/viewer?view=layer&layer=1&button=A&mode=flight
/viewer?view=action&search=cycle+missile
/viewer?view=cheatsheet&mode=flight&layer=0
/viewer?view=controller&layer=1&button=A
```

### Implementation

- Use Next.js `useSearchParams` or custom hook
- Encode: view, layer ID, button name, mode, search query
- Decode on mount to restore state
- Update URL on state change (replace, not push — avoid cluttering history)

---

## Acceptance Criteria

- [ ] Print export generates clean one-page reference card
- [ ] Keyboard shortcuts work for view navigation
- [ ] URLs encode view state for sharing
- [ ] Deep links restore correct view state on load
