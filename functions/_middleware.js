const MARKDOWN = {
  '/': () => `# Retirement Withdrawal Calculator

A flexible retirement withdrawal calculator stress-tested against 150+ years of real U.S. market history.

## What it does

Set your savings, timeline, portfolio mix, and withdrawal rules. The calculator replays your plan through every starting month since 1871 and reports how it would have held up.

## How to use

1. **Your Savings** — Enter your nest egg and choose a retirement length (5–60 years)
2. **Your Goal** — Preserve capital, spend it down, or set a custom retention target
3. **Investment Mix** — All stocks, balanced (60/40), conservative, or build a custom portfolio
4. **Withdrawal Rules** — Set minimum and maximum monthly income limits
5. **Run Analysis** — View results: median income, success rate, charts, and full historical data

## Data

- U.S. Equity: S&P 500 total return (monthly, 1871–2023)
- Treasury Bonds: 10-year constant maturity (monthly, 1871–2023)
- Gold: free-market era (monthly, 1968–2023)
- Inflation: CPI-U for real-return calculations

## Links

- [Privacy Policy](/privacy)
- [Terms of Use](/terms)
- [Source Code](https://github.com/YidiDev/retirement-planning-calculator)

MIT License. Not financial advice.
`,

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
