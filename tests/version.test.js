import { describe, expect, it } from 'vitest';
import { bumpPatch, compareVersions, parseVersion } from '../scripts/version-utils.mjs';

describe('version utilities', () => {
  it('parses strict semver without prerelease metadata', () => {
    expect(parseVersion('1.2.3')).toEqual([1, 2, 3]);
    expect(() => parseVersion('1.2')).toThrow(/Invalid VERSION/);
    expect(() => parseVersion('v1.2.3')).toThrow(/Invalid VERSION/);
  });

  it('compares versions by major, minor, patch', () => {
    expect(compareVersions('1.0.0', '1.0.0')).toBe(0);
    expect(compareVersions('1.0.1', '1.0.0')).toBe(1);
    expect(compareVersions('1.1.0', '1.9.9')).toBe(-1);
    expect(compareVersions('2.0.0', '1.99.99')).toBe(1);
  });

  it('bumps patch versions', () => {
    expect(bumpPatch('0.1.0')).toBe('0.1.1');
  });
});
