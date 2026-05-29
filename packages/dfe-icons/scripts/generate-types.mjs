#!/usr/bin/env node

/** Regenerate types/index.d.ts from src/manifest.ts without re-running SVGR. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(packageRoot, 'src/manifest.ts');
const typesDir = path.join(packageRoot, 'types');

const manifestSource = fs.readFileSync(manifestPath, 'utf-8');
const match = manifestSource.match(
  /export const iconManifest = (\[[\s\S]*?\]) as const;/,
);
if (!match) {
  console.error('Could not parse icon names from src/manifest.ts');
  process.exit(1);
}

const allIcons = JSON.parse(match[1]);
fs.mkdirSync(typesDir, { recursive: true });

const consumerTypesLines = [
  'import type { ComponentType, SVGProps } from "react";',
  '',
  'export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;',
  '',
  'export declare const iconManifest: readonly string[];',
  'export type IconName = string;',
  '',
  ...allIcons.map((name) => `export declare const ${name}: IconComponent;`),
  '',
];

fs.writeFileSync(
  path.join(typesDir, 'index.d.ts'),
  consumerTypesLines.join('\n'),
);

console.log(`Wrote types/index.d.ts (${allIcons.length} icons)`);
