import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const files = [
  'src/main.js',
  'src/app.js',
  'src/assets.js',
  'src/charts.js',
  'src/worker.js',
  ...readdirSync(resolve('src/templates')).map(f => `src/templates/${f}`),
];

for (const f of files) {
  execFileSync('node', ['--check', f], { stdio: 'inherit' });
}

console.log(`Checked ${files.length} JavaScript files.`);
