import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function usable(value: string | undefined): string | undefined {
  if (value == null) {
    return undefined;
  }
  const candidate = value.trim().replace(/^v(?=\d)/i, '');
  return candidate || undefined;
}

function versionFromFile(root: string): string | undefined {
  try {
    return usable(readFileSync(join(root, 'VERSION'), 'utf8'));
  } catch {
    return undefined;
  }
}

/**
 * Prefer the VERSION file hyperi-ci stamps at release. Env is a local
 * fallback when the stamp is not on disk.
 */
export function resolveAppVersion({
  root,
  env = process.env,
}: {
  root: string;
  env?: NodeJS.ProcessEnv;
}): string | undefined {
  return (
    versionFromFile(root) ??
    usable(env.HYPERCI_VERSION) ??
    usable(env.NEXT_PUBLIC_APP_VERSION)
  );
}

/**
 * The `env` block next.config hands Next to inline. Always defines the key so
 * consumers compile to a literal; '' means nothing was stamped.
 */
export function appVersionEnv(options: {
  root: string;
  env?: NodeJS.ProcessEnv;
}): { NEXT_PUBLIC_APP_VERSION: string } {
  return { NEXT_PUBLIC_APP_VERSION: resolveAppVersion(options) ?? '' };
}
