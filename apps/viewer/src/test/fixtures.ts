/**
 * Fixture file loaders for tests
 */

import { readFileSync } from 'fs'
import { join } from 'path'

const FIXTURES_DIR = join(__dirname, '../__tests__/fixtures')

/**
 * Load a fixture file as a string
 */
export function loadFixture(filename: string): string {
  return readFileSync(join(FIXTURES_DIR, filename), 'utf-8')
}

/**
 * Load a JSON fixture file and parse it
 */
export function loadJsonFixture<T = unknown>(filename: string): T {
  return JSON.parse(loadFixture(filename))
}

/**
 * Load the sample reWASD fixture
 */
export function loadSampleRewasd(): unknown {
  return loadJsonFixture('sample.rewasd')
}

/**
 * Load the sample Star Citizen actionmaps XML fixture
 */
export function loadSampleActionMaps(): string {
  return loadFixture('sample-actionmaps.xml')
}
