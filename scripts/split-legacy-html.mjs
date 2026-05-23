import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const htmlPath = resolve(root, 'retirement_calculator.html');
const srcDir = resolve(root, 'src');
const html = readFileSync(htmlPath, 'utf8');

function mustMatch(regex, label) {
  const match = html.match(regex);
  if (!match) throw new Error(`Unable to extract ${label}`);
  return match[1];
}

const styles = mustMatch(/<style>([\s\S]*?)<\/style>/, 'styles').trim();
const bodyInner = mustMatch(/<body>([\s\S]*?)<script id="worker-src"/m, 'body').trim();
const worker = mustMatch(/<script id="worker-src" type="javascript\/worker">([\s\S]*?)<\/script>/, 'worker').trim();
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1].trim());
const calculator = scripts.at(-1);
if (!calculator) throw new Error('Unable to extract calculator script');

mkdirSync(srcDir, { recursive: true });
writeFileSync(resolve(srcDir, 'styles.css'), `@import "tailwindcss";\n\n${styles}\n`, 'utf8');
writeFileSync(resolve(srcDir, 'worker.js'), `${worker}\n`, 'utf8');
writeFileSync(resolve(srcDir, 'legacy-calculator.js'), `${calculator}\n`, 'utf8');
writeFileSync(
  resolve(root, 'index.html'),
  `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Retirement Withdrawal Calculator</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body x-data="calculatorShell">
${bodyInner.replaceAll('%APP_VERSION%', '<span x-text="version"></span>')}
  <script id="worker-src" type="javascript/worker">
${worker}
  </script>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
`,
  'utf8',
);
