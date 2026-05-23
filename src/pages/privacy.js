export function privacyPage() {
  const SITE = 'Retirement Withdrawal Calculator';
  const REPO = 'https://github.com/YidiDev/retirement-planning-calculator';
  return `
<div class="legal-page">
  <a href="/" class="back-link">&larr; Back to calculator</a>
  <h1>Privacy Policy</h1>
  <p class="updated">Last updated: January 2025</p>

  <h2>Overview</h2>
  <p>The ${SITE} is an open-source, client-side web application.
    Your financial data never leaves your browser. There is no
    server-side storage, no user accounts, and no database of
    personal information.</p>

  <h2>Data You Enter</h2>
  <p>All inputs you provide (savings amount, retirement length,
    portfolio choices, withdrawal rules) are processed entirely
    in your browser using a Web Worker. No input data is
    transmitted to any server.</p>
  <p>Your configuration is saved in the URL query string so you
    can bookmark or share it. This data exists only in your
    browser's address bar and history.</p>

  <h2>Analytics</h2>
  <p>If configured by the site operator, this application may use
    Google Analytics 4 to collect anonymous usage data including:</p>
  <ul>
    <li>Pages visited and time spent</li>
    <li>Feature interactions (which buttons are clicked, which
      settings are changed)</li>
    <li>Browser type, screen size, and general location (country
      level)</li>
    <li>Scroll depth and session duration</li>
  </ul>
  <p>Analytics data is aggregated and anonymous. No personally
    identifiable information is collected. You can block analytics
    by using a browser extension like uBlock Origin or by
    disabling JavaScript.</p>

  <h2>Error Tracking</h2>
  <p>If configured, this application may use Sentry for automatic
    error reporting. When an error occurs, technical details
    (error message, stack trace, browser version) may be sent to
    Sentry. No personal or financial data is included in error
    reports.</p>

  <h2>Cookies</h2>
  <p>This application does not set any first-party cookies.
    Third-party analytics services may set their own cookies
    subject to their privacy policies.</p>

  <h2>Third-Party Services</h2>
  <ul>
    <li><strong>Google Analytics</strong> &mdash;
      <a href="https://policies.google.com/privacy" target="_blank"
        rel="noopener">Google Privacy Policy</a></li>
    <li><strong>Sentry</strong> &mdash;
      <a href="https://sentry.io/privacy/" target="_blank"
        rel="noopener">Sentry Privacy Policy</a></li>
    <li><strong>Google Fonts</strong> &mdash; loaded for
      typography; subject to
      <a href="https://policies.google.com/privacy" target="_blank"
        rel="noopener">Google's privacy policy</a></li>
  </ul>

  <h2>Open Source</h2>
  <p>This application is open source under the MIT License. You
    can review the complete source code at
    <a href="${REPO}" target="_blank" rel="noopener">GitHub</a>
    to verify these privacy claims.</p>

  <h2>Changes</h2>
  <p>This policy may be updated occasionally. Changes will be
    reflected in the "Last updated" date above and committed to
    the public repository.</p>

  <h2>Contact</h2>
  <p>Questions about this privacy policy can be raised as an
    issue on the
    <a href="${REPO}/issues" target="_blank"
      rel="noopener">GitHub repository</a>.</p>
</div>`;
}
