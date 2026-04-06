# Plan 04: Chain Resolver v2

**Beads:** `controller-7l1`
**Phase:** 1d (Foundation)
**Dependencies:** [01-data-types-v2.md](01-data-types-v2.md), [02-rewasd-parser-v2.md](02-rewasd-parser-v2.md), [03-key-mappings.md](03-key-mappings.md)
**Plan overview:** [00-overview.md](00-overview.md)

---

## Goal

Build a new chain resolver that walks each macro step individually, resolves keyboard steps against `kb1_*` bindings and gamepad steps against `gp1_*` bindings, and produces a `BindingIndex` for all views to query.

---

## Current State

**File:** `src/lib/parsers/chainResolver.ts`

Current behavior:
- Takes flattened key lists from reWASD parser
- Finds SC actions matching ANY of the output keys
- Creates separate `UnifiedMapping` entries with no link between them
- Loses multi-action sequence relationships
- Ignores gamepad outputs entirely

---

## New Resolver Design

### Main function

```typescript
function resolveBindings(
  rewasdMappings: ParsedRewasdMappingV2[],
  xmlBindings: ParsedXmlBinding[],
  defaultActions: DefaultAction[],   // Fallback for unresolved kb keys
  layers: ShiftLayer[]
): BindingIndex
```

### Resolution algorithm

For each `ParsedRewasdMappingV2`:

1. Create a `ResolvedBinding` with button, layer, activator info
2. Walk each macro step:
   - **Keyboard `down` step**: Look up the normalized key in custom XML `kb1_*` bindings. If not found, fall back to `defaultActions.ts`. Record the `ResolvedAction` with `resolvedVia: 'keyboard'`.
   - **Gamepad `down` step**: Map the gamepad button via `REWASD_GP_TO_SC`, then look up in XML `gp1_*` bindings. Record with `resolvedVia: 'gamepad'`.
   - **`up` steps**: Skip (they end an action, don't start one)
   - **Pause steps**: Preserve in macro sequence but don't resolve
   - **Mouse/rumble steps**: Preserve but don't resolve
3. Set `source` based on resolution:
   - All actions resolved via custom XML → `'rewasd+xml'`
   - Some via gamepad → `'rewasd+xml-gamepad'`
   - Some via defaults → `'rewasd+default'`
   - None resolved → `'rewasd-unresolved'`
4. Add to the binding list

### Deduplication of resolved actions

A macro might press and release the same key multiple times. Only count unique `down` events as action triggers. If a key goes down, up, then down again, that's two separate triggers of the same action.

### Building the BindingIndex

After resolving all bindings, build the index maps:

- `byButtonLayerActivator`: 3-level nested map for O(1) lookup
- `byAction`: Group bindings by action name (reverse lookup)
- `byMode`: Group by gameplay mode
- `byLayer`: Group by layer ID
- `byButton`: Group by button name (all layers)
- `stats`: Compute summary statistics

### Layer inheritance

For each layer that has a parent:
1. Find all buttons mapped in the child layer
2. For buttons NOT mapped in the child, copy the parent layer's bindings
3. Mark inherited bindings with a flag so the UI can dim them
4. Respect `unheritableMasks` — blocked buttons get NO binding (not inherited)

---

## SC Default Fallback

When a keyboard key has no matching `kb1_*` in the custom XML:

1. Search `defaultActions.ts` for any action with that keyboard key as a default binding
2. If found, create a `ResolvedAction` with the default action info
3. Tag the `ResolvedBinding` source as `'rewasd+default'`
4. The UI should show "(SC default)" indicator for these

---

## Testing

### Key test cases

1. **Simple chain**: X Main single → DIK_INSERT → kb1_insert → v_weapon_cycle_missile_fwd
2. **Multi-action macro**: A Main start → 15 steps → multiple SC actions in sequence
3. **Gamepad passthrough**: Mapping with GP:DpadUp → gp1_dpad_up → SC action
4. **Mixed macro**: Keyboard + gamepad steps → actions resolved via both paths
5. **Unresolved binding**: DIK code with no XML or default match → source = unresolved
6. **Default fallback**: Key not in custom XML but exists in defaultActions
7. **Layer inheritance**: Sub-layer missing button X → inherits from parent
8. **Index queries**: Verify byAction, byLayer, byButton return correct results

---

## Acceptance Criteria

- [ ] Per-step macro resolution (not flattened key matching)
- [ ] Both keyboard and gamepad outputs resolved
- [ ] SC default fallback for unresolved keyboard keys
- [ ] Layer inheritance with `unheritableMasks` support
- [ ] BindingIndex built with all query maps
- [ ] Stats computed correctly
- [ ] Unit tests for all 8 test cases
- [ ] Existing resolver remains available (no breaking changes)
