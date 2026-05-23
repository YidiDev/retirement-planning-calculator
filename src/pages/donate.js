export function donatePage() {
  const SPONSORS = 'https://github.com/sponsors/YidiDev';

  return `
<main class="legal-page donate-page" aria-label="Support the project">
  <a href="/" class="back-link">&larr; Back to calculator</a>
  <p class="eyebrow">Open-source support</p>
  <h1>Keep the calculator free</h1>
  <p class="donate-lede">This retirement calculator runs entirely in your browser,
    uses public historical market data, and stays free for everyone. If it helped
    you test a plan, a GitHub Sponsors contribution helps maintain the data,
    tests, accessibility checks, and ongoing improvements.</p>

  <div class="donate-panel">
    <div>
      <h2>Support ongoing work</h2>
      <p>No account, tracking, or paywall is required to use the calculator.
        Sponsorship is optional and goes toward keeping the project maintained.</p>
    </div>
    <a class="donate-button" href="${SPONSORS}" target="_blank" rel="noopener noreferrer">
      Sponsor on GitHub
    </a>
  </div>

  <h2>What sponsorship supports</h2>
  <ul>
    <li>Refreshing and validating long-run market data.</li>
    <li>Keeping the calculator private, client-side, and dependency-light.</li>
    <li>Maintaining tests, accessibility checks, and browser compatibility.</li>
  </ul>

  <p class="donate-note">Thank you for supporting independent open-source retirement planning tools.</p>
</main>`;
}
