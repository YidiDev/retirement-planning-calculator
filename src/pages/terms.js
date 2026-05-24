export function termsPage() {
  const SITE = 'Retirement Withdrawal Calculator';
  const REPO = 'https://github.com/YidiDev/retirement-planning-calculator';
  return `
<div class="legal-page">
  <a href="/" class="back-link">&larr; Back to calculator</a>
  <h1>Terms of Use</h1>
  <p class="updated">Last updated: January 2025</p>

  <h2>Acceptance</h2>
  <p>By using the ${SITE}, you agree to these terms. If you do
    not agree, do not use the application.</p>

  <h2>Nature of the Service</h2>
  <p>This application is a free, open-source educational tool
    that runs historical simulations of retirement withdrawal
    strategies. It is provided "as is" without warranty of any
    kind.</p>

  <h2>Not Financial Advice</h2>
  <p><strong>This calculator is not financial advice.</strong>
    Results are based on historical market data from 1871 to 2023
    and do not predict future performance. Past results do not
    guarantee future returns.</p>
  <p>You should consult a qualified financial advisor, tax
    professional, or other appropriate expert before making any
    financial decisions based on information from this tool.</p>

  <h2>No Warranty</h2>
  <p>The software is provided without warranty of any kind,
    express or implied, including but not limited to the
    warranties of merchantability, fitness for a particular
    purpose, and noninfringement. The authors are not liable for
    any claim, damages, or other liability arising from use of
    the software.</p>

  <h2>Data Accuracy</h2>
  <p>Historical market data is sourced from Robert Shiller's
    publicly available dataset and other public sources. While
    we make reasonable efforts to ensure accuracy, we do not
    guarantee that the data is error-free or complete.</p>

  <h2>User Responsibility</h2>
  <p>All calculations run entirely in your browser. You are
    responsible for the inputs you provide and the conclusions
    you draw from the results.</p>

  <h2>Open Source License</h2>
  <p>The source code is available under the
    <a href="${REPO}/blob/main/LICENSE" target="_blank"
      rel="noopener">MIT License</a>. You may use, modify, and
    distribute it subject to that license.</p>

  <h2>Changes</h2>
  <p>These terms may be updated. Changes will be reflected in
    the "Last updated" date and committed to the
    <a href="${REPO}" target="_blank"
      rel="noopener">public repository</a>.</p>
</div>`;
}
