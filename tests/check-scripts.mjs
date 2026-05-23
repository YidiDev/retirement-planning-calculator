import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const html = readFileSync('index.html', 'utf8');
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map((m) => m[1].trim()).filter(Boolean);

scripts.forEach((script, index) => {
  const path = `/tmp/retirement-index-script-${index}.js`;
  writeFileSync(path, script, 'utf8');
  execFileSync('node', ['--check', path], { stdio: 'inherit' });
});

execFileSync('node', ['--check', 'src/main.js'], { stdio: 'inherit' });
execFileSync('node', ['--check', 'src/legacy-calculator.js'], { stdio: 'inherit' });
execFileSync('node', ['--check', 'src/worker.js'], { stdio: 'inherit' });
console.log(`Checked ${scripts.length + 3} JavaScript files/snippets.`);
