/**
 * Use Playwright to extract all binding data from the running app.
 * Re-parses configs inside the browser where DOMParser is available.
 * Usage: npx tsx scripts/extract-bindings.ts
 */
import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('Navigating to app...');
  await page.goto('http://localhost:3000/?view=controller');
  await page.waitForTimeout(4000);

  // Inject a script that imports parsers through Next.js module system
  // and re-resolves all bindings, then returns structured data
  const data = await page.evaluate(async () => {
    // Fetch raw configs
    const [rewasdText, xmlText] = await Promise.all([
      fetch('/configs/GCO 4.7 HOTAS.rewasd').then(r => r.text()),
      fetch('/configs/layout_GCO-4-7-HOTAS.xml').then(r => r.text()),
    ]);

    // Parse XML using browser DOMParser
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    // Extract all kb1_ and gp1_ bindings from the XML
    const xmlBindings: Array<{
      actionName: string;
      actionMap: string;
      input: string;
    }> = [];

    const actionMaps = xmlDoc.querySelectorAll('actionmap');
    for (const am of actionMaps) {
      const mapName = am.getAttribute('name') || '';
      const actions = am.querySelectorAll('action');
      for (const action of actions) {
        const actionName = action.getAttribute('name') || '';
        const rebinds = action.querySelectorAll('rebind');
        for (const rebind of rebinds) {
          const input = rebind.getAttribute('input') || '';
          if (input.startsWith('kb1_') || input.startsWith('gp1_')) {
            xmlBindings.push({ actionName, actionMap: mapName, input });
          }
        }
      }
    }

    return {
      xmlBindingsCount: xmlBindings.length,
      xmlSample: xmlBindings.slice(0, 20),
      allXmlBindings: xmlBindings,
    };
  });

  console.log(`XML bindings extracted: ${data.xmlBindingsCount}`);
  console.log('\nSample XML bindings:');
  for (const b of data.xmlSample) {
    console.log(`  ${b.actionName} [${b.actionMap}] <- ${b.input}`);
  }

  // Build a lookup from the XML data
  const kbMap = new Map<string, Array<{ actionName: string; actionMap: string }>>();
  for (const b of data.allXmlBindings) {
    if (b.input.startsWith('kb1_')) {
      const key = b.input.slice(4);
      if (!kbMap.has(key)) kbMap.set(key, []);
      kbMap.get(key)!.push({ actionName: b.actionName, actionMap: b.actionMap });
    }
  }

  console.log(`\nUnique keyboard keys in XML: ${kbMap.size}`);
  for (const [key, actions] of Array.from(kbMap.entries()).slice(0, 20)) {
    console.log(`  ${key}: ${actions.map(a => a.actionName).join(', ')}`);
  }

  // Now let's also get what the app is actually displaying
  // Extract text from all binding panels
  const panelTexts = await page.evaluate(() => {
    // The panels are absolutely positioned divs with bg-zinc-950
    // Each has a header (font-semibold) and rows
    const results: Record<string, string[]> = {};

    // Find all panel containers - they're absolute positioned with rounded border
    const containers = document.querySelectorAll('div.absolute.rounded.border');
    for (const container of containers) {
      const header = container.querySelector('.font-semibold');
      if (!header) continue;
      const buttonName = header.textContent?.trim() || '';
      if (!buttonName) continue;

      const rows: string[] = [];
      const entryDivs = container.querySelectorAll('.flex.items-center.gap-1');
      for (const row of entryDivs) {
        rows.push(row.textContent?.trim() || '');
      }
      results[buttonName] = rows;
    }
    return results;
  });

  console.log(`\n${'═'.repeat(60)}`);
  console.log('  APP DISPLAY: What each button panel shows');
  console.log(`${'═'.repeat(60)}`);

  // Sort by panel name
  const sortedPanels = Object.entries(panelTexts).sort(([a], [b]) => a.localeCompare(b));
  let totalEntries = 0;
  for (const [button, rows] of sortedPanels) {
    if (rows.length === 0) continue;
    console.log(`\n── ${button} (${rows.length} entries) ──`);
    for (const row of rows) {
      console.log(`  ${row}`);
    }
    totalEntries += rows.length;
  }
  console.log(`\nTotal displayed entries: ${totalEntries}`);

  // Save the full data dump
  const dumpPath = 'screenshots/binding-dump.json';
  writeFileSync(dumpPath, JSON.stringify({
    xmlBindings: data.allXmlBindings,
    panelDisplay: panelTexts,
  }, null, 2));
  console.log(`\nFull data saved to ${dumpPath}`);

  await browser.close();
}

main().catch(console.error);
