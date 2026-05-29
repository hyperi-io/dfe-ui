#!/usr/bin/env node

import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

execSync('node scripts/generate.mjs', {
  cwd: packageRoot,
  stdio: 'inherit',
});

const status = execSync('git status --porcelain -- src/ stories/AllIcons.stories.tsx', {
  cwd: packageRoot,
  encoding: 'utf-8',
}).trim();

if (status) {
  console.error(
    [
      '@repo/dfe-icons generated output is out of date.',
      'Run: yarn workspace @repo/dfe-icons generate',
      'Then commit changes under packages/dfe-icons/src/ and stories/AllIcons.stories.tsx',
      '',
      status,
    ].join('\n'),
  );
  process.exit(1);
}

console.log('@repo/dfe-icons generated output is up to date.');
