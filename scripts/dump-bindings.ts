/**
 * Extract all binding data per button from the 4.7 HOTAS config.
 * Uses regex-based XML parsing to avoid DOMParser dependency.
 * Usage: npx tsx scripts/dump-bindings.ts
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';

const viewerSrc = join(__dirname, '..', 'apps', 'viewer', 'src');
function toFileUrl(p: string) { return pathToFileURL(p).href; }

/**
 * Parse SC XML input string like "kb1_lshift+f7" or "gp1_dpad_up"
 * into typed components matching ParsedXmlBinding structure.
 */
function parseInput(rawInput: string): {
  inputType: 'keyboard' | 'gamepad' | 'mouse' | 'joystick';
  inputKey: string;
  modifiers: string[];
} | null {
  // Determine device type from prefix
  let inputType: 'keyboard' | 'gamepad' | 'mouse' | 'joystick';
  let rest: string;

  if (rawInput.startsWith('kb1_')) {
    inputType = 'keyboard';
    rest = rawInput.slice(4); // Remove "kb1_"
  } else if (rawInput.startsWith('gp1_')) {
    inputType = 'gamepad';
    rest = rawInput.slice(4); // Remove "gp1_"
  } else if (rawInput.startsWith('mo1_')) {
    inputType = 'mouse';
    rest = rawInput.slice(4);
  } else if (rawInput.startsWith('js')) {
    inputType = 'joystick';
    const underscoreIdx = rawInput.indexOf('_');
    rest = underscoreIdx >= 0 ? rawInput.slice(underscoreIdx + 1) : rawInput;
  } else {
    return null;
  }

  // For keyboard: split modifiers (lshift, rshift, lalt, ralt, lctrl, rctrl) from key
  // SC format: "lshift+f7" means modifier=lshift, key=f7
  if (inputType === 'keyboard') {
    const parts = rest.split('+');
    if (parts.length > 1) {
      const key = parts[parts.length - 1];
      const modifiers = parts.slice(0, -1);
      return { inputType, inputKey: key, modifiers };
    }
    return { inputType, inputKey: rest, modifiers: [] };
  }

  return { inputType, inputKey: rest, modifiers: [] };
}

/** Regex-based SC XML parser producing ParsedXmlBinding-compatible objects */
function parseXmlWithRegex(xmlText: string) {
  const bindings: Array<{
    actionMap: string;
    actionName: string;
    inputType: 'keyboard' | 'gamepad' | 'mouse' | 'joystick';
    inputKey: string;
    modifiers: string[];
    activationMode?: string;
    multiTap?: number;
    rawInput: string;
  }> = [];

  const actionMapRe = /<actionmap\s+name="([^"]+)"[^>]*>([\s\S]*?)<\/actionmap>/g;
  let amMatch;
  while ((amMatch = actionMapRe.exec(xmlText)) !== null) {
    const mapName = amMatch[1];
    const mapContent = amMatch[2];

    const actionRe = /<action\s+name="([^"]+)"[^>]*>([\s\S]*?)<\/action>/g;
    let actMatch;
    while ((actMatch = actionRe.exec(mapContent)) !== null) {
      const actionName = actMatch[1];
      const actionContent = actMatch[2];

      const rebindRe = /<rebind\s+([^>]+)\/?>/g;
      let rebMatch;
      while ((rebMatch = rebindRe.exec(actionContent)) !== null) {
        const attrs = rebMatch[1];
        const inputMatch = attrs.match(/input="([^"]+)"/);
        const multiTapMatch = attrs.match(/multiTap="([^"]+)"/);
        const activationMatch = attrs.match(/activationMode="([^"]+)"/);

        if (inputMatch) {
          const rawInput = inputMatch[1];
          const parsed = parseInput(rawInput);
          if (parsed) {
            bindings.push({
              actionMap: mapName,
              actionName,
              inputType: parsed.inputType,
              inputKey: parsed.inputKey,
              modifiers: parsed.modifiers,
              activationMode: activationMatch?.[1],
              multiTap: multiTapMatch ? parseInt(multiTapMatch[1]) : undefined,
              rawInput,
            });
          }
        }
      }
    }
  }

  return { bindings, profileName: 'regex-parsed', errors: [] as string[] };
}

async function main() {
  const rewasdJson = readFileSync(
    join(__dirname, '..', 'apps', 'viewer', 'public', 'configs', 'GCO 4.7 HOTAS.rewasd'), 'utf-8'
  );
  const scXml = readFileSync(
    join(__dirname, '..', 'apps', 'viewer', 'public', 'configs', 'layout_GCO-4-7-HOTAS.xml'), 'utf-8'
  );

  const { parseRewasdJsonV2 } = await import(toFileUrl(join(viewerSrc, 'lib', 'parsers', 'rewasdParser.ts')));
  const { resolveBindingsV2 } = await import(toFileUrl(join(viewerSrc, 'lib', 'parsers', 'chainResolver.ts')));

  // Also load SC defaults from defaultProfile.xml
  // parseDefaultProfile uses fast-xml-parser, works in Node.js
  const { parseDefaultProfile } = await import(toFileUrl(join(viewerSrc, 'lib', 'parsers', 'defaultProfileParser.ts')));
  const defaultProfileXml = readFileSync(
    join(__dirname, '..', 'apps', 'viewer', 'public', 'configs', 'sc-4.7', 'defaultProfile.xml'), 'utf-8'
  );
  const scDefaults = parseDefaultProfile(defaultProfileXml);

  const rewasdResult = parseRewasdJsonV2(rewasdJson);
  const xmlResult = parseXmlWithRegex(scXml);

  console.log(`reWASD mappings: ${rewasdResult.mappings.length}`);
  console.log(`XML bindings: ${xmlResult.bindings.length}`);
  console.log(`SC defaults: ${scDefaults.length}`);

  const bindingIndex = resolveBindingsV2(rewasdResult, xmlResult as any, scDefaults);

  // Stats
  console.log(`\n=== Binding Data Dump: 4.7 HOTAS ===`);
  console.log(`Total bindings: ${bindingIndex.all.length}`);
  console.log(`Bindings with actions: ${bindingIndex.all.filter((b: any) => b.actions.length > 0).length}`);
  console.log(`Layers: ${bindingIndex.layers.map((l: any) => `${l.id}:${l.name}`).join(', ')}`);
  console.log();

  // All buttons in the order we display them (including axis virtual buttons)
  const PANEL_BUTTONS = [
    'LSUp', 'LSDown', 'LSLeft', 'LSRight',
    'RSUp', 'RSDown', 'RSLeft', 'RSRight',
    'DpadUp', 'DpadDown', 'DpadLeft', 'DpadRight',
    'A', 'B', 'X', 'Y',
    'LB', 'RB', 'LT', 'RT',
    'View', 'Menu', 'Xbox',
    'LS', 'RS',
    'P1', 'P2', 'P3', 'P4',
    // Analog axes (native SC gamepad bindings)
    'LSX', 'LSY', 'RSX', 'RSY', 'LTAxis', 'RTAxis', 'LT+RT',
  ];

  for (const button of PANEL_BUTTONS) {
    const bindings = bindingIndex.byButton.get(button) || [];
    const withActions = bindings.filter((b: any) => b.actions.length > 0);

    if (withActions.length === 0) {
      console.log(`\n── ${button} ── (no bindings)`);
      continue;
    }

    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  ${button}  (${withActions.length} bindings)`);
    console.log(`${'═'.repeat(60)}`);

    // Sort by layer then activator
    const activatorOrder: Record<string, number> = {
      single: 0, double: 1, long: 2, start: 3, release: 4
    };
    withActions.sort((a: any, b: any) => {
      if (a.layer.id !== b.layer.id) return a.layer.id - b.layer.id;
      return (activatorOrder[a.activator.type] ?? 9) - (activatorOrder[b.activator.type] ?? 9);
    });

    for (const binding of withActions) {
      const layer = binding.layer;
      const layerLabel = layer.isDefault ? 'Main' : `[${layer.name}]`;
      const actType = binding.activator.type;
      const actMode = binding.activator.mode;
      const actDisplay = actType === 'single' ? '' : ` (${actType})`;
      const modeDisplay = actMode !== 'onetime' ? ` [${actMode}]` : '';
      const desc = binding.description || '';

      // Show each resolved action
      for (const action of binding.actions) {
        const modeBadge = action.gameplayMode !== 'Unknown' ? `${action.gameplayMode}` : '';
        console.log(
          `  ${layerLabel.padEnd(14)} ${modeBadge.padEnd(10)} ${action.displayName}${actDisplay}${modeDisplay}`
        );
        console.log(
          `  ${''.padEnd(14)} ${''.padEnd(10)} → ${action.name} [${action.actionMap}] via ${action.matchedInput}`
        );
      }
      if (desc) {
        console.log(`  ${''.padEnd(14)} ${''.padEnd(10)} desc: "${desc}"`);
      }
    }
  }

  // Also dump unresolved bindings (ones we skipped because actions.length === 0)
  const unresolved = bindingIndex.all.filter((b: any) => b.actions.length === 0);
  console.log(`\n\n${'═'.repeat(60)}`);
  console.log(`  UNRESOLVED BINDINGS: ${unresolved.length} total`);
  console.log(`${'═'.repeat(60)}`);
  for (const b of unresolved) {
    const keys = b.macro?.keyboardKeysOutput?.join('+') || 'none';
    const gpBtns = b.macro?.gamepadButtonsOutput?.join('+') || '';
    console.log(`  ${b.button.padEnd(12)} ${(b.layer.isDefault ? 'Main' : b.layer.name).padEnd(14)} ${b.activator.type.padEnd(8)} keys: ${keys} ${gpBtns ? `gp: ${gpBtns}` : ''}`);
  }
  // Count breakdowns
  const emptyKeys = unresolved.filter((b: any) => !b.macro?.keyboardKeysOutput?.length && !b.macro?.gamepadButtonsOutput?.length);
  const withKeys = unresolved.filter((b: any) => b.macro?.keyboardKeysOutput?.length || b.macro?.gamepadButtonsOutput?.length);
  console.log(`  --- ${emptyKeys.length} empty (intentionally disabled), ${withKeys.length} with keys/gp ---`);
}

main().catch(console.error);
