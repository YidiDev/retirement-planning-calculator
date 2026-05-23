import { buildAnalysisInput, parseCalculatorSearch, renderIndexMarkdown } from '../src/calculator-state.js';
import { runAnalysis } from '../src/worker.js';

const MARKDOWN = {
  '/privacy': () => `# Privacy Policy

Last updated: January 2025

## Overview

The Retirement Withdrawal Calculator is an open-source, client-side web application. Your financial data never leaves your browser. There is no server-side storage, no user accounts, and no database of personal information.

## Data You Enter

All inputs (savings amount, retirement length, portfolio choices, withdrawal rules) are processed entirely in your browser using a Web Worker. No input data is transmitted to any server.

Your configuration is saved in the URL query string so you can bookmark or share it. This data exists only in your browser's address bar and history.

## Analytics

If configured, the application may use Google Analytics 4 to collect anonymous usage data including pages visited, feature interactions, browser type, screen size, general location (country level), scroll depth, and session duration. No personally identifiable information is collected.

## Error Tracking

If configured, Sentry may capture technical error details (error message, stack trace, browser version). No personal or financial data is included.

## Cookies

No first-party cookies. Third-party analytics services may set their own cookies.

## Third-Party Services

- [Google Analytics Privacy Policy](https://policies.google.com/privacy)
- [Sentry Privacy Policy](https://sentry.io/privacy/)
- [Google Fonts Privacy Policy](https://policies.google.com/privacy)

## Open Source

Source code: [GitHub](https://github.com/YidiDev/retirement-planning-calculator)

## Contact

[Open an issue](https://github.com/YidiDev/retirement-planning-calculator/issues)
`,

  '/terms': () => `# Terms of Use

Last updated: January 2025

## Acceptance

By using the Retirement Withdrawal Calculator, you agree to these terms.

## Nature of the Service

This is a free, open-source educational tool that runs historical simulations of retirement withdrawal strategies. It is provided "as is" without warranty of any kind.

## Not Financial Advice

**This calculator is not financial advice.** Results are based on historical market data from 1871 to 2023 and do not predict future performance. Consult a qualified financial advisor before making financial decisions.

## No Warranty

The software is provided without warranty of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, and noninfringement.

## Data Accuracy

Historical market data is sourced from Robert Shiller's publicly available dataset and other public sources. We do not guarantee the data is error-free or complete.

## Open Source License

Source code is available under the [MIT License](https://github.com/YidiDev/retirement-planning-calculator/blob/main/LICENSE).

## Contact

[Open an issue](https://github.com/YidiDev/retirement-planning-calculator/issues)
`,
};

export async function onRequest(context) {
  const accept = (context.request.headers.get('Accept') || '').toLowerCase();
  const url = new URL(context.request.url);
  const path = url.pathname.replace(/\/+$/, '') || '/';

  if (accept.includes('text/markdown') && path === '/') {
    const state = parseCalculatorSearch(url.search);
    const analysis = state._autoRun ? runAnalysis(buildAnalysisInput(state)) : null;

    return new Response(renderIndexMarkdown(state, analysis), {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  if (accept.includes('text/markdown') && MARKDOWN[path]) {
    return new Response(MARKDOWN[path](), {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  return context.next();
}
