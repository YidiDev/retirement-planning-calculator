import { execFileSync } from 'node:child_process';

const files = ['src/main.js', 'src/app.js', 'src/charts.js', 'src/analytics.js', 'src/sentry.js', 'src/worker.js'];

for (const f of files) {
  execFileSync('node', ['--check', f], { stdio: 'inherit' });
}

console.log(`Checked ${files.length} JavaScript files.`);
