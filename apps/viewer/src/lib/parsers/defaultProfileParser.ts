/**
 * Parser for Star Citizen defaultProfile.xml
 *
 * Extracts all actionmap actions with their bindings, metadata, and categories.
 * Uses fast-xml-parser for Node.js compatibility (build-time generation).
 */

import { XMLParser } from 'fast-xml-parser'
import type { SCDefaultAction, SCActivationMode } from '../types/defaultProfile'

/** Action maps excluded from output (debug/internal) */
const EXCLUDED_MAPS = new Set(['debug'])

const ATTR = '@_'

/** Ensure a value is always an array */
function toArray<T>(val: T | T[] | undefined): T[] {
  if (val === undefined) return []
  return Array.isArray(val) ? val : [val]
}

/** Normalize bind values: null/empty/whitespace-only → null */
function cleanBindValue(value: string | number | undefined): string | null {
  if (value === undefined || value === null) return null
  const str = String(value)
  if (str.trim() === '') return null
  return str
}

/** Read an attribute from a parsed element (attributes are prefixed with @_) */
function attr(el: Record<string, unknown>, name: string): string | undefined {
  const val = el[`${ATTR}${name}`]
  if (val === undefined || val === null) return undefined
  return String(val)
}

/**
 * Parse defaultProfile.xml content into SCDefaultAction[].
 * Deduplicates by action name, skips debug/flashui/no-metadata actions.
 */
export function parseDefaultProfile(xmlString: string): SCDefaultAction[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: ATTR,
    trimValues: false,
    isArray: (name) => name === 'actionmap' || name === 'action',
  })

  const parsed = parser.parse(xmlString)
  const profile = parsed.profile ?? parsed
  const actionMaps = toArray(profile?.actionmap)

  if (actionMaps.length === 0) {
    throw new Error('XML parse error: no actionmap elements found')
  }

  const actions: SCDefaultAction[] = []
  const seenNames = new Set<string>()

  for (const map of actionMaps) {
    const mapName = attr(map, 'name') ?? ''
    if (EXCLUDED_MAPS.has(mapName)) continue

    const version = attr(map, 'version') ?? null
    const uiCategory = attr(map, 'UICategory') ?? null

    for (const action of toArray(map.action)) {
      const actionName = attr(action, 'name')
      if (!actionName) continue
      if (seenNames.has(actionName)) continue
      if (actionName.startsWith('flashui')) continue

      const label = attr(action, 'UILabel') ?? null
      const description = attr(action, 'UIDescription') ?? null
      const category = attr(action, 'Category') ?? null

      // Skip actions with no metadata (no label, description, or category)
      if (!label && !description && !category) continue

      seenNames.add(actionName)

      const activationModeRaw = attr(action, 'activationMode') as SCActivationMode | undefined

      actions.push({
        actionName,
        mapName,
        keyboardBind: cleanBindValue(attr(action, 'keyboard')),
        mouseBind: cleanBindValue(attr(action, 'mouse')),
        gamepadBind: cleanBindValue(attr(action, 'gamepad')),
        joystickBind: cleanBindValue(attr(action, 'joystick')),
        keyboardBindable: !!attr(action, 'keyboard'),
        mouseBindable: !!attr(action, 'mouse'),
        gamepadBindable: !!attr(action, 'gamepad'),
        joystickBindable: !!attr(action, 'joystick'),
        activationMode: activationModeRaw ?? null,
        category: category ?? null,
        UICategory: uiCategory,
        label: label?.trim() ?? '',
        description: description?.trim() || null,
        version,
        optionGroup: attr(action, 'optionGroup') ?? null,
      })
    }
  }

  return actions
}

/** Filter actions belonging to a specific action map */
export function filterActionsByMap(actions: SCDefaultAction[], mapName: string): SCDefaultAction[] {
  return actions.filter((a) => a.mapName === mapName)
}

/** Get unique action map names from parsed actions */
export function getDefaultActionMapNames(actions: SCDefaultAction[]): string[] {
  return [...new Set(actions.map((a) => a.mapName))]
}

/** Build a lookup map from actionName → SCDefaultAction */
export function buildActionLookup(actions: SCDefaultAction[]): Map<string, SCDefaultAction> {
  const lookup = new Map<string, SCDefaultAction>()
  for (const action of actions) {
    lookup.set(action.actionName, action)
  }
  return lookup
}
