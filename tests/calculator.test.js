import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('index.html structure', () => {
  const html = readFileSync('index.html', 'utf8');

  it('uses Alpine x-data on main element', () => {
    expect(html).toContain('x-data="calculator"');
  });

  it('includes worker-src script tag', () => {
    expect(html).toContain('id="worker-src"');
  });

  it('references the module entry point', () => {
    expect(html).toContain('src="/src/main.js"');
  });

  it('has the warm paper design', () => {
    expect(html).toContain('Newsreader');
    expect(html).toContain('Source+Sans+3');
  });

  it('has the portfolio builder with Custom option', () => {
    expect(html).toContain("setStrategy('custom')");
    expect(html).toContain('showCustom');
    expect(html).toContain('addAsset');
  });

  it('has clean withdrawal rules with both mode and validation', () => {
    // Each model binding appears exactly once
    const floorInputCount = (html.match(/x-model\.number="minFloorPct"/g) || []).length;
    const incomeInputCount = (html.match(/x-model\.number="minIncome"/g) || []).length;
    expect(floorInputCount).toBe(1);
    expect(incomeInputCount).toBe(1);
    // Both mode exists
    expect(html).toContain("floorMode='both'");
    expect(html).toContain("capMode='both'");
    // Validation warning exists
    expect(html).toContain('withdrawalWarning');
  });
});

describe('source file size limits', () => {
  const MAX_LINES = 320;
  const srcFiles = ['src/main.js', 'src/app.js', 'src/charts.js', 'src/analytics.js', 'src/sentry.js'];

  for (const file of srcFiles) {
    it(`${file} is under ${MAX_LINES} lines`, () => {
      const lines = readFileSync(file, 'utf8').split('\n').length;
      expect(lines).toBeLessThanOrEqual(MAX_LINES);
    });
  }
});
