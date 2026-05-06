#!/usr/bin/env node
/**
 * Runs `yarn npm audit` in the root and every workspace package.
 * Translates npm's `--audit-level` (e.g. from hyperi-ci) to Yarn's `--severity`.
 */
import { spawnSync } from 'child_process';

const args = process.argv.slice(2).flatMap((arg) => {
  const match = arg.match(/^--audit-level=(.+)$/);
  return match ? ['--severity', match[1]] : [arg];
});

const yarnArgs = [
  'workspaces',
  'foreach',
  '-Av',
  'exec',
  'yarn',
  'npm',
  'audit',
  ...args,
];

const result = spawnSync('yarn', yarnArgs, { stdio: 'inherit' });

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
