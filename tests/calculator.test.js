import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('built app source', () => {
  it('contains the portfolio source builder and Alpine entrypoint', () => {
    const html = readFileSync('index.html', 'utf8');
    const main = readFileSync('src/main.js', 'utf8');

    expect(html).toContain('id="sourceGroups"');
    expect(html).toContain('id="allocList"');
    expect(html).toContain('x-data="calculatorShell"');
    expect(main).toContain('alpinejs');
  });

  it('keeps stale assumptions out of the Vite entry', () => {
    const html = readFileSync('index.html', 'utf8');

    expect(html).not.toContain('Assumes 100% invested in an S&amp;P 500 index fund');
    expect(html).toContain('current calculator mapping uses long-history sleeves');
  });
});
