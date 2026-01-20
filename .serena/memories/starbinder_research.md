# StarBinder Research - SC XML Improvements

## Overview

We need to improve our Star Citizen XML handling to match StarBinder's capabilities. StarBinder (https://starbinder.space/) has solved many of the mapping/categorization issues we're facing.

## Downloaded Files Location

`apps/starbinder-reference/` contains:
- `index.html` - Main page
- `script.js` - Main application logic (~163KB)
- `style.css` - Styling
- `keybinds.json` - **KEY FILE**: Action metadata with labels, descriptions, keywords/categories
- `localisation.json` - i18n translations

## StarBinder's keybinds.json Structure

```json
{
  "v_emergency_exit": {
    "label": "Emergency Exit",
    "description": "Powers off the ship...",
    "keywords": [
      "vehicles - seats and operator modes",
      "seats",
      "vehicle"
    ]
  }
}
```

Each action has:
- `label` - Human-readable name
- `description` - What the action does
- `keywords` - Array of categories/tags for filtering

## Key Differences from Our Approach

1. **Action Metadata**: StarBinder has a curated JSON with labels/descriptions for ALL actions
2. **Category System**: Uses keywords array instead of relying on actionmap names
3. **Default Bindings**: Shows default SC bindings, not just custom ones
4. **activationMode Handling**: Proper support for all activation modes

## Research Tasks Needed

1. **Analyze keybinds.json**: Extract category structure, count actions, compare to our data
2. **Analyze script.js**: Understand how they parse XML, handle categories, display bindings
3. **Compare action names**: Match their keybinds.json to our parsed actions
4. **Understand MappedActions.js**: They import from `./MappedActions.js` - need to find this

## Current Issues in Our System

1. `vehicle_general` actionmap not showing in UI
2. No sub-grouping within flight/vehicle categories
3. multiTap="2" displays same as single tap
4. No action descriptions or human-readable labels

## Activation Mode Research Findings

From defaultProfile.xml research:
- `activationMode="double_tap"` = preset with `onPress=1, onHold=0, onRelease=0, multiTap=2, multiTapBlock=1`
- `multiTap="2"` alone = uses default behavior (likely fires on release)
- Key difference: double_tap fires on 2nd press immediately, multiTap=2 may fire on release

## Next Steps

1. Create comprehensive action metadata JSON (like keybinds.json)
2. Implement proper category hierarchy
3. Show multiTap and activationMode distinctly in UI
4. Consider importing StarBinder's keybinds.json as reference data
