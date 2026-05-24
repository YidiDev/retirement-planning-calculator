import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1366, height: 1000 } });
const page = await context.newPage();
await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
await page.waitForSelector('#sourceGroups .source-pill');

const results = await new AxeBuilder({ page })
  .disableRules(['color-contrast'])
  .analyze();

await browser.close();

if (results.violations.length) {
  for (const violation of results.violations) {
    console.error(`${violation.id}: ${violation.help}`);
    for (const node of violation.nodes.slice(0, 3)) console.error(`  ${node.target.join(' ')}`);
  }
  throw new Error(`${results.violations.length} accessibility violation(s) found`);
}

console.log('Accessibility smoke test passed.');
