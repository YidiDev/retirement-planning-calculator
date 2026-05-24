import { describe, expect, it } from 'vitest';
import { onRequest } from '../functions/_middleware.js';
import { buildAnalysisInput, parseCalculatorSearch, passLabel } from '../src/calculator-state.js';
import { runAnalysis } from '../src/worker.js';

function markdownRequest(url) {
  return onRequest({
    request: new globalThis.Request(url, { headers: { Accept: 'text/markdown' } }),
    next: () => new globalThis.Response('fallback'),
  });
}

describe('markdown middleware', () => {
  it('serves agent instructions for the plain index markdown', async () => {
    const response = await markdownRequest('https://example.com/');
    const body = await response.text();

    expect(response.headers.get('Content-Type')).toContain('text/markdown');
    expect(body).toContain('## Agent Instructions');
    expect(body).toContain('Accept: text/markdown');
    expect(body).toContain('run=1');
  });

  it('renders query parameters without running analysis', async () => {
    const response = await markdownRequest('https://example.com/?savings=1200000&years=35&retainPct=25');
    const body = await response.text();

    expect(body).toContain('## Requested Plan');
    expect(body).toContain('Savings: $1,200,000');
    expect(body).toContain('Retirement length: 35 years');
    expect(body).toContain('Analysis was not run');
  });

  it('runs the same analysis core when run is set', async () => {
    const search = '?savings=1000000&years=5&minIncome=3000&maxIncome=6000&run=1';
    const state = parseCalculatorSearch(search);
    const analysis = runAnalysis(buildAnalysisInput(state));
    const response = await markdownRequest('https://example.com/' + search);
    const body = await response.text();

    expect(body).toContain('## Results');
    expect(body).toContain(`Success rate: ${passLabel(analysis.best)}`);
    expect(body).toContain(`Historical windows tested: ${analysis.rows.length}`);
  });
});
