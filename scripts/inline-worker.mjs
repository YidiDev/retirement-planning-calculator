/**
 * Reads src/worker.js and inlines it into the worker-src script tag in index.html.
 * Run as: node scripts/inline-worker.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const workerSrc = readFileSync(resolve(root, 'src/worker.js'), 'utf8');
const htmlPath = resolve(root, 'index.html');
let html = readFileSync(htmlPath, 'utf8');

const placeholder = /<script id="worker-src" type="javascript\/worker">[\s\S]*?<\/script>/i;
const replacement = `<script id="worker-src" type="javascript/worker">\n${workerSrc}\n  </script>`;

if (!placeholder.test(html)) {
  throw new Error('Could not find worker-src script tag in index.html');
}

html = html.replace(placeholder, replacement);
writeFileSync(htmlPath, html, 'utf8');
console.log('Inlined worker source into index.html');
