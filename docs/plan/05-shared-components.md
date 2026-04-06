# Plan 05: Shared UI Components

**Beads:** `controller-8uf`
**Phase:** 2a
**Dependencies:** [01-data-types-v2.md](01-data-types-v2.md) (needs types for props)
**Plan overview:** [00-overview.md](00-overview.md)

---

## Goal

Build reusable UI components shared across all views: MacroChainViz, LayerBadge, ActivatorBadge, and GameplayModeBadge.

---

## Components

### 1. MacroChainViz

Visualizes the full mapping chain: `Button → [Macro] → Key → SC Action`

**Two modes:**
- **Compact**: Single line with arrows — `A → INSERT → Cycle Missile Fwd`
- **Expanded**: Step-by-step with timing for multi-action macros

**Props:**
```typescript
interface MacroChainVizProps {
  binding: ResolvedBinding;
  mode: 'compact' | 'expanded';
  showRawKeys?: boolean;  // Show DIK codes for debugging
}
```

**Behavior:**
- Simple macros (isSimple=true): Always show compact, one-line chain
- Multi-action macros: Show step list with numbered actions, pause indicators, action names
- Unresolved steps: Show key name in amber with "?" icon
- Gamepad steps: Show with gamepad icon to distinguish from keyboard

**Used in:** Layer Browser, Action Search, Controller Visual detail panel

### 2. LayerBadge

Shows which shift layer a binding belongs to.

```typescript
interface LayerBadgeProps {
  layer: ShiftLayer;
  size?: 'sm' | 'md';
  showTrigger?: boolean;  // Show "Hold LB" text
}
```

**Color scheme:**
```
Main    → Blue (#3B82F6)
LB      → Green (#10B981)
Y       → Amber (#F59E0B)
Menu    → Purple (#8B5CF6)
View    → Red (#EF4444)
Start   → Pink (#EC4899)
LS      → Cyan (#06B6D4)
Sub-*   → Gray (#6B7280)
```

### 3. ActivatorBadge

Shows the activator type with icon.

```typescript
interface ActivatorBadgeProps {
  type: ActivatorType;
  mode?: ActivatorMode;
  size?: 'sm' | 'md';
}
```

**Icons:**
- `single` → tap icon (finger tap)
- `double` → double-tap icon
- `long` → long-press icon (finger hold)
- `start` → down-arrow (press & hold)
- `release` → up-arrow (on release)

Use simple SVG icons or emoji fallbacks. Keep them small and scannable.

### 4. GameplayModeBadge

Consistent badge for gameplay modes.

```typescript
interface GameplayModeBadgeProps {
  mode: GameplayMode;
  size?: 'sm' | 'md';
}
```

Mode labels: Flight, FPS, Mining, EVA, Vehicle, General, Spectator, etc.

---

## File Structure

```
src/components/shared/
  MacroChainViz.tsx
  LayerBadge.tsx
  ActivatorBadge.tsx
  GameplayModeBadge.tsx
  index.ts              // barrel export
```

---

## Acceptance Criteria

- [ ] All 4 components implemented and exported
- [ ] MacroChainViz handles both simple and multi-action macros
- [ ] LayerBadge shows consistent colors across all views
- [ ] Components work with the v2 type system
- [ ] Storybook or visual test for each component (optional)
