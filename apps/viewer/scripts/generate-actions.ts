#!/usr/bin/env npx tsx
/**
 * Build-time generator: defaultProfile.xml + global.ini → static TypeScript data
 *
 * Usage: npx tsx scripts/generate-actions.ts --version 4.5
 *
 * Reads from:  public/configs/sc-{version}/defaultProfile.xml
 *              public/configs/sc-{version}/global.ini
 * Writes to:   src/lib/data/sc-{version}/defaultActions.ts
 *              src/lib/data/sc-{version}/localization.ts
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, resolve } from 'path'
import { parseDefaultProfile } from '../src/lib/parsers/defaultProfileParser'
import { parseGlobalIni } from '../src/lib/parsers/globalIniParser'

const appRoot = resolve(__dirname, '..')

function main() {
  const versionIdx = process.argv.indexOf('--version')
  if (versionIdx === -1 || !process.argv[versionIdx + 1]) {
    console.error('Usage: npx tsx scripts/generate-actions.ts --version <version>')
    console.error('Example: npx tsx scripts/generate-actions.ts --version 4.5')
    process.exit(1)
  }
  const version = process.argv[versionIdx + 1]

  const configDir = join(appRoot, 'public', 'configs', `sc-${version}`)
  const xmlPath = join(configDir, 'defaultProfile.xml')
  const iniPath = join(configDir, 'global.ini')

  console.log(`Reading SC ${version} data from ${configDir}`)

  // Parse XML
  const xmlContent = readFileSync(xmlPath, 'utf-8')
  const actions = parseDefaultProfile(xmlContent)
  console.log(`  Parsed ${actions.length} actions from defaultProfile.xml`)

  // Parse INI
  const iniContent = readFileSync(iniPath, 'utf-8')
  const locMap = parseGlobalIni(iniContent)
  console.log(`  Parsed ${locMap.size} localization keys from global.ini`)

  // Write output
  const outDir = join(appRoot, 'src', 'lib', 'data', `sc-${version}`)
  mkdirSync(outDir, { recursive: true })

  const timestamp = new Date().toISOString()

  // --- defaultActions.ts ---
  const actionsJson = JSON.stringify(actions, null, 2)
  const actionsFile = `// AUTO-GENERATED — DO NOT EDIT
// Source: defaultProfile.xml (Star Citizen ${version})
// Generated: ${timestamp}
import type { SCDefaultAction } from '../../types/defaultProfile'

export const SC_VERSION = '${version}'

export const defaultActions: SCDefaultAction[] = ${actionsJson}
`
  const actionsPath = join(outDir, 'defaultActions.ts')
  writeFileSync(actionsPath, actionsFile, 'utf-8')
  console.log(`  Wrote ${actionsPath}`)

  // --- localization.ts ---
  const locObj: Record<string, string> = {}
  for (const [key, value] of locMap) {
    locObj[key] = value
  }
  const locJson = JSON.stringify(locObj, null, 2)
  const locFile = `// AUTO-GENERATED — DO NOT EDIT
// Source: global.ini (Star Citizen ${version})
// Generated: ${timestamp}

export const localization: Record<string, string> = ${locJson}
`
  const locPath = join(outDir, 'localization.ts')
  writeFileSync(locPath, locFile, 'utf-8')
  console.log(`  Wrote ${locPath}`)

  console.log(`\nDone! Generated SC ${version} data with ${actions.length} actions and ${locMap.size} localization keys.`)
}

main()
