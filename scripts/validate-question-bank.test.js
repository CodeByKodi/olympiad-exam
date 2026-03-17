/**
 * Unit tests for question-bank validator.
 * Runs validator against fixtures and checks error output.
 */

import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const FIXTURES = join(ROOT, 'scripts', '__fixtures__', 'question-bank-invalid');

function runValidator() {
  try {
    execSync('node scripts/validate-question-bank.js', {
      cwd: ROOT,
      env: { ...process.env, VALIDATE_QB_ROOT: FIXTURES },
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

describe('validate-question-bank', () => {
  it('fails on invalid fixture data', () => {
    const result = runValidator();
    expect(result.exitCode).toBe(1);
    expect(result.output).toContain('--- ERRORS ---');
  });

  it('reports malformed JSON', () => {
    const result = runValidator();
    expect(result.output).toMatch(/bad\.json.*malformed JSON/i);
  });

  it('reports manifest referencing non-existent file', () => {
    const result = runValidator();
    expect(result.output).toMatch(/manifest.*missing\.json|non-existent.*missing/i);
  });

  it('reports empty question file', () => {
    const result = runValidator();
    expect(result.output).toMatch(/empty\.json.*empty/i);
  });

  it('reports duplicate id and invalid correctAnswer', () => {
    const result = runValidator();
    expect(result.output).toMatch(/duplicate id|invalid-q/i);
    expect(result.output).toMatch(/correctAnswer|out of range/i);
  });

  it('reports pack exam/grade mismatch and bad questionIds', () => {
    const result = runValidator();
    expect(result.output).toMatch(/bad-pack|exam.*match|grade.*match|nonexistent/i);
  });
});
