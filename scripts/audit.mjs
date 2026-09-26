#!/usr/bin/env node
/**
 * Runs `yarn npm audit` once per workspace, so findings are attributed to the
 * package that pulls them in rather than arriving as one undifferentiated list.
 *
 * Two Yarn defaults have to be worked around:
 *  - Yarn audits only the *direct* dependencies of a workspace, so `--recursive`
 *    is required to cover the transitive tree the way `npm audit` does.
 *  - `yarn workspaces foreach` aborts on the first failing workspace, which hides
 *    every workspace after it. We iterate ourselves and audit all of them.
 *
 * Translates npm's `--audit-level` (e.g. from hyperi-ci) to Yarn's `--severity`.
 */
import { spawnSync } from 'child_process';

const args = process.argv
  .slice(2)
  .flatMap((arg) => {
    const match = arg.match(/^--audit-level=(.+)$/);
    return match ? ['--severity', match[1]] : [arg];
  })
  // We iterate the workspaces ourselves; `--all` inside each one would audit
  // every workspace once per workspace.
  .filter((arg) => arg !== '-A' && arg !== '--all');

const auditArgs = [
  'npm',
  'audit',
  ...(args.includes('-R') || args.includes('--recursive') ? [] : ['--recursive']),
  ...args,
];

const yarn = (yarnArgs, options = {}) =>
  spawnSync('yarn', yarnArgs, { encoding: 'utf8', ...options });

const listed = yarn(['workspaces', 'list', '--json']);

if (listed.error || listed.status !== 0) {
  console.error(listed.error ?? listed.stderr);
  process.exit(1);
}

const workspaces = listed.stdout
  .split('\n')
  .filter((line) => line.trim())
  .map((line) => JSON.parse(line));

const results = [];

for (const workspace of workspaces) {
  console.log(`\n=== ${workspace.name} (${workspace.location}) ===`);

  const audit = yarn(['workspace', workspace.name, ...auditArgs], {
    stdio: 'inherit',
  });

  if (audit.error) {
    console.error(audit.error);
  }

  results.push({ ...workspace, ok: !audit.error && audit.status === 0 });
}

const width = Math.max(...results.map((result) => result.name.length));

console.log('\n=== audit summary ===');
for (const result of results) {
  console.log(`  ${result.name.padEnd(width)}  ${result.ok ? 'ok' : 'FINDINGS'}`);
}

process.exit(results.every((result) => result.ok) ? 0 : 1);
