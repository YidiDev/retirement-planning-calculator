import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { bumpPatch, compareVersions, parseVersion } from './version-utils.mjs';

function runGit(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

function versionAt(ref) {
  return runGit(['show', `${ref}:VERSION`]);
}

const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const [key, ...rest] = arg.replace(/^--/, '').split('=');
  return [key, rest.join('=') || true];
}));

const baseRef = args.base;
const write = Boolean(args.write);
if (!baseRef) throw new Error('Usage: node scripts/ensure-version-bump.mjs --base=<ref> [--write]');

const upstream = versionAt(baseRef);
const current = readFileSync('VERSION', 'utf8').trim();
parseVersion(current);

if (compareVersions(current, upstream) > 0) {
  console.log(`VERSION ${current} is higher than upstream ${upstream}.`);
  process.exit(0);
}

const next = bumpPatch(upstream);
if (!write) {
  throw new Error(`VERSION ${current} must be higher than upstream ${upstream}. Next patch version: ${next}`);
}

writeFileSync('VERSION', `${next}\n`, 'utf8');
console.log(`Bumped VERSION from ${current} to ${next} because upstream is ${upstream}.`);
