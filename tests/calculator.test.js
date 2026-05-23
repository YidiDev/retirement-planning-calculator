import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';

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

  it('does not contain stale assumptions', () => {
    expect(html).not.toContain('Assumes 100% invested');
    expect(html).not.toContain('since 1871');
  });
});

describe('source file size limits', () => {
  const MAX_LINES = 300;
  const srcFiles = [
    'src/main.js', 'src/app.js', 'src/assets.js', 'src/charts.js',
    ...readdirSync('src/templates').map(f => `src/templates/${f}`),
  ];

  for (const file of srcFiles) {
    it(`${file} is under ${MAX_LINES} lines`, () => {
      const lines = readFileSync(file, 'utf8').split('\n').length;
      expect(lines).toBeLessThanOrEqual(MAX_LINES);
    });
  }
});

describe('template functions export correctly', () => {
  it('all template files export a function', async () => {
    const files = readdirSync('src/templates').filter(f => f.endsWith('.js'));
    for (const f of files) {
      const mod = await import(`../src/templates/${f}`);
      const fns = Object.values(mod).filter(v => typeof v === 'function');
      expect(fns.length).toBeGreaterThanOrEqual(1);
      for (const fn of fns) {
        const html = fn();
        expect(typeof html).toBe('string');
        expect(html.length).toBeGreaterThan(10);
      }
    }
  });
});
