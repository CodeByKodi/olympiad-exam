import { describe, it, expect } from 'vitest';
import { resolveStaticPath, getAssetPath } from './config.js';

describe('resolveStaticPath / getAssetPath', () => {
  it('returns empty string for null or empty input', () => {
    expect(resolveStaticPath(null)).toBe('');
    expect(resolveStaticPath('')).toBe('');
    expect(getAssetPath(null)).toBe('');
  });

  it('returns empty string for non-string input', () => {
    expect(resolveStaticPath(123)).toBe('');
  });

  it('prepends base path to relative path', () => {
    const result = resolveStaticPath('question-bank/nso/grade3/syllabus.json');
    expect(result).toContain('question-bank');
    expect(result).toContain('nso');
    expect(result).toContain('grade3');
    expect(result).toContain('syllabus.json');
  });

  it('strips leading slash from path', () => {
    const result = resolveStaticPath('/question-bank/test.json');
    expect(result).not.toMatch(/^\/\//);
  });

  it('getAssetPath returns same as resolveStaticPath', () => {
    const path = 'images/logo.png';
    expect(getAssetPath(path)).toBe(resolveStaticPath(path));
  });
});
