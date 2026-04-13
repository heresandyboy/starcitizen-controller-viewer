/**
 * Generate a .descriptions.json template from a reWASD config.
 *
 * Pre-populates with:
 * - Existing reWASD descriptions (marked if French)
 * - SC action display names as placeholders
 * - Empty strings for bindings that need manual annotation
 *
 * Usage: npx tsx scripts/generate-descriptions.ts
 *        npx tsx scripts/generate-descriptions.ts --rewasd "GCO 4.7 HOTAS"
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const CONFIGS_DIR = join(__dirname, '..', 'apps', 'viewer', 'public', 'configs');

// Dynamic imports for ESM modules
async function main() {
  const { parseRewasdConfigV2 } = await import('../apps/viewer/src/lib/parsers/rewasdParser');
  const { parseStarCitizenXml } = await import('../apps/viewer/src/lib/parsers/xmlParser');
  const { resolveBindingsV2 } = await import('../apps/viewer/src/lib/parsers/chainResolver');
  const { parseDefaultProfile } = await import('../apps/viewer/src/lib/parsers/defaultProfileParser');

  // Parse CLI args
  const args = process.argv.slice(2);
  const nameIdx = args.indexOf('--rewasd');
  const configName = nameIdx >= 0 && args[nameIdx + 1] ? args[nameIdx + 1] : 'GCO 4.7 HOTAS';

  const rewasdPath = join(CONFIGS_DIR, `${configName}.rewasd`);
  if (!existsSync(rewasdPath)) {
    console.error(`reWASD config not found: ${rewasdPath}`);
    process.exit(1);
  }

  // Find matching XML — try layout_GCO-*.xml pattern
  const xmlName = configName.replace(/ /g, '-');
  let xmlPath = join(CONFIGS_DIR, `layout_${xmlName}.xml`);
  if (!existsSync(xmlPath)) {
    // Try without layout_ prefix
    xmlPath = join(CONFIGS_DIR, `${xmlName}.xml`);
  }
  if (!existsSync(xmlPath)) {
    console.error(`SC XML not found for "${configName}". Looked for layout_${xmlName}.xml`);
    console.error('Continuing without custom XML (using defaults only)...');
    xmlPath = '';
  }

  // Load default profile
  const defaultProfilePath = join(CONFIGS_DIR, 'sc-4.7', 'defaultProfile.xml');
  const defaultProfileText = existsSync(defaultProfilePath)
    ? readFileSync(defaultProfilePath, 'utf-8')
    : '';
  const scDefaults = defaultProfileText ? parseDefaultProfile(defaultProfileText) : [];

  // Parse
  const rewasdText = readFileSync(rewasdPath, 'utf-8');
  const rewasdConfig = JSON.parse(rewasdText);
  const rewasdResult = parseRewasdConfigV2(rewasdConfig);

  const xmlText = xmlPath ? readFileSync(xmlPath, 'utf-8') : '<ActionMaps></ActionMaps>';
  const xmlResult = parseStarCitizenXml(xmlText);

  const bindingIndex = resolveBindingsV2(rewasdResult, xmlResult, scDefaults);

  // Build descriptions template
  const descriptions: Record<string, string> = {};
  const existingPath = join(CONFIGS_DIR, `${configName}.descriptions.json`);
  let existingDescs: Record<string, string> = {};

  if (existsSync(existingPath)) {
    try {
      const existing = JSON.parse(readFileSync(existingPath, 'utf-8'));
      existingDescs = existing.descriptions || {};
      console.log(`Found existing descriptions: ${Object.keys(existingDescs).length} entries`);
    } catch {
      console.warn('Could not parse existing descriptions file');
    }
  }

  // Sort bindings by button, layer, activator for readability
  const sorted = [...bindingIndex.all].sort((a, b) => {
    if (a.button !== b.button) return a.button.localeCompare(b.button);
    if (a.layer.id !== b.layer.id) return a.layer.id - b.layer.id;
    return a.activator.type.localeCompare(b.activator.type);
  });

  for (const binding of sorted) {
    // Use existing custom description if available
    if (existingDescs[binding.id]) {
      descriptions[binding.id] = existingDescs[binding.id];
      continue;
    }

    // Use reWASD description if it exists
    if (binding.description) {
      descriptions[binding.id] = binding.description;
      continue;
    }

    // Use SC action display names as placeholder
    if (binding.actions.length > 0) {
      const actionSummary = binding.actions
        .slice(0, 3)
        .map(a => a.displayName || a.name)
        .join(' / ');
      const suffix = binding.actions.length > 3 ? ` (+${binding.actions.length - 3} more)` : '';
      descriptions[binding.id] = `TODO: ${actionSummary}${suffix}`;
    } else {
      descriptions[binding.id] = '';
    }
  }

  const output = {
    $schema: 'controller-descriptions-v1',
    config: configName,
    descriptions,
  };

  const outputPath = join(CONFIGS_DIR, `${configName}.descriptions.json`);
  writeFileSync(outputPath, JSON.stringify(output, null, 2) + '\n');

  const todoCount = Object.values(descriptions).filter(d => d.startsWith('TODO:')).length;
  const emptyCount = Object.values(descriptions).filter(d => d === '').length;
  const filledCount = Object.values(descriptions).filter(d => d && !d.startsWith('TODO:')).length;

  console.log(`\nGenerated: ${outputPath}`);
  console.log(`  Total bindings: ${Object.keys(descriptions).length}`);
  console.log(`  Pre-filled:     ${filledCount}`);
  console.log(`  TODO (SC names): ${todoCount}`);
  console.log(`  Empty:           ${emptyCount}`);
  console.log(`\nEdit the file to replace TODO: entries with your own descriptions.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
