#!/usr/bin/env node
/**
 * Data validation - runs all data validators.
 * Validates: question-bank, syllabus, sample-packs.
 * Optional: starter-packs if folder exists.
 * Exits with code 1 if any validation fails.
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const VALIDATORS = [
  { name: 'Question Bank', script: 'validate:question-bank' },
  { name: 'Syllabus', script: 'validate:syllabus' },
];

const OPTIONAL = [
  { name: 'Starter Packs', script: 'validate:packs', path: 'public/starter-packs' },
];

console.log('Data validation...\n');

let failed = false;

for (const { name, script } of VALIDATORS) {
  try {
    console.log(`Running ${name} validation...`);
    execSync(`npm run ${script}`, {
      cwd: ROOT,
      stdio: 'inherit',
    });
    console.log(`  ✓ ${name} passed\n`);
  } catch {
    console.error(`  ✗ ${name} failed\n`);
    failed = true;
  }
}

for (const { name, script, path: relPath } of OPTIONAL) {
  const fullPath = join(ROOT, relPath);
  if (!existsSync(fullPath)) {
    console.log(`Skipping ${name} (${relPath} not found)\n`);
    continue;
  }
  try {
    console.log(`Running ${name} validation...`);
    execSync(`npm run ${script}`, {
      cwd: ROOT,
      stdio: 'inherit',
    });
    console.log(`  ✓ ${name} passed\n`);
  } catch {
    console.error(`  ✗ ${name} failed\n`);
    failed = true;
  }
}

if (failed) {
  console.error('Data validation failed. Fix errors above before deploying.');
  process.exit(1);
}

console.log('All data validations passed.');
