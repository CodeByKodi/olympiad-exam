/**
 * Unit tests for syllabus validator.
 * Runs validator against fixtures and checks error output.
 */

import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const FIXTURES = join(ROOT, 'scripts', '__fixtures__', 'syllabus-invalid');

function runValidator() {
  try {
    execSync('node scripts/validate-syllabus.js', {
      cwd: ROOT,
      env: { ...process.env, VALIDATE_SYLLABUS_ROOT: FIXTURES },
      encoding: 'utf-8',
    });
    return { exitCode: 0, output: '' };
  } catch (e) {
    return {
      exitCode: e.status ?? 1,
      output: (e.stdout || '') + (e.stderr || ''),
    };
  }
}

describe('validate-syllabus', () => {
  it('fails on invalid fixture data', () => {
    const result = runValidator();
    expect(result.exitCode).toBe(1);
    expect(result.output).toContain('--- ERRORS ---');
  });

  it('reports index referencing non-existent grade file', () => {
    const result = runValidator();
    expect(result.output).toMatch(/missing-grade|non-existent/i);
  });
});
