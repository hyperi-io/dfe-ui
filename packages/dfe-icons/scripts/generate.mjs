#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { transform } from '@svgr/core';
import { optimize } from 'svgo';
import svgrConfig from '../.svgrrc.json' with { type: 'json' };

const LOGO_SVGO_PLUGINS = [
  'convertStyleToAttrs',
  {
    name: 'convertColors',
    params: {
      currentColor: true,
      names2hex: false,
      rgb2hex: false,
      shorthex: false,
      shortname: false,
    },
  },
];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SVG_DIR = path.join(ROOT, 'svg');
const SRC_DIR = path.join(ROOT, 'src');
const ICONS_DIR = path.join(SRC_DIR, 'icons');
const STORIES_DIR = path.join(ROOT, 'stories');
const TYPES_DIR = path.join(ROOT, 'types');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toPascalCase(str) {
  return str
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/** One path segment only — no traversal (build script; satisfies SAST). */
const SAFE_SEGMENT = /^[A-Za-z0-9_.-]+$/;

function assertSafeSegment(segment, label = 'path') {
  if (!SAFE_SEGMENT.test(segment)) {
    throw new Error(`Invalid ${label}: ${segment}`);
  }
}

// ---------------------------------------------------------------------------
// Component generation via @svgr/core
// ---------------------------------------------------------------------------

/** Logo SVGs: map every paint color (hex, rgb(), keywords, inline styles) to currentColor. */
function prepareLogoSvg(svgContent) {
  return optimize(svgContent, { plugins: LOGO_SVGO_PLUGINS }).data;
}

async function generateComponentSource(name, svgString, { isLogo = false } = {}) {
  const input = isLogo ? prepareLogoSvg(svgString) : svgString;
  const config = isLogo
    ? {
        ...svgrConfig,
        svgProps: { ...svgrConfig.svgProps, fill: 'currentColor' },
      }
    : svgrConfig;
  return transform(input, config, { componentName: name });
}

// ---------------------------------------------------------------------------
// Directory processing
// ---------------------------------------------------------------------------

async function processDirectory(dir, suffix = '', { isLogo = false } = {}) {
  if (!fs.existsSync(dir)) return [];

  const icons = [];
  const dirHandle = await fs.promises.opendir(dir);
  for await (const entry of dirHandle) {
    if (!entry.isFile() || !entry.name.endsWith('.svg')) continue;

    const basename = entry.name;
    assertSafeSegment(basename, 'svg file');
    const baseName = basename.replace('.svg', '');
    const componentName = 'Icon' + toPascalCase(baseName) + suffix;
    const outName = `${componentName}.tsx`;
    assertSafeSegment(outName, 'output file');

    const svgPath = `${dir}${path.sep}${basename}`;
    const svgContent = fs.readFileSync(svgPath, 'utf-8');

    try {
      const source = await generateComponentSource(componentName, svgContent, {
        isLogo,
      });
      const outFile = `${ICONS_DIR}${path.sep}${outName}`;
      fs.writeFileSync(outFile, source);
      icons.push(componentName);
    } catch (err) {
      console.warn(`  skip ${basename}: ${err.message}`);
    }
  }

  icons.sort();
  return icons;
}

// ---------------------------------------------------------------------------
// Story generation
// ---------------------------------------------------------------------------

function generateStory() {
  return `import React, { useState, useMemo } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import * as Icons from "../src";
import "./AllIcons.css";

type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

const iconEntries = (
  Object.entries(Icons) as [string, IconComponent][]
).filter(([name]) => name.startsWith("Icon"));

function IconGallery() {
  const [filter, setFilter] = useState("");
  const [style, setStyle] = useState<"all" | "outline" | "filled">("all");

  const filtered = useMemo(
    () =>
      iconEntries.filter(([name]) => {
        const matchesSearch = name
          .toLowerCase()
          .includes(filter.toLowerCase());
        if (!matchesSearch) return false;
        if (style === "filled") return name.endsWith("Filled");
        if (style === "outline") return !name.endsWith("Filled");
        return true;
      }),
    [filter, style],
  );

  return (
    <div className="icon-gallery">
      <div className="icon-gallery-header">
        <input
          className="icon-gallery-search"
          type="text"
          placeholder="Search icons\u2026"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <div className="icon-gallery-filters">
          {(["all", "outline", "filled"] as const).map((s) => (
            <button
              key={s}
              className={\`icon-gallery-filter-btn\${style === s ? " active" : ""}\`}
              onClick={() => setStyle(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <span className="icon-gallery-count">
          {filtered.length} / {iconEntries.length}
        </span>
      </div>
      <div className="icon-gallery-grid">
        {filtered.map(([name, Icon]) => (
          <div key={name} className="icon-gallery-item" title={name}>
            <Icon className="size-6" />
            <span className="icon-gallery-name">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const meta = {
  title: "Icons/All Icons",
  component: IconGallery,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof IconGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Gallery: Story = {};
`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

console.log('Generating icon components…');

fs.rmSync(SRC_DIR, { recursive: true, force: true });
fs.mkdirSync(ICONS_DIR, { recursive: true });
fs.mkdirSync(STORIES_DIR, { recursive: true });

// Auto-discover all subdirectories under svg/.
// Only "filled" gets a "Filled" suffix; everything else has no suffix.
const SUFFIX_MAP = { filled: 'Filled' };

const subdirs = fs
  .readdirSync(SVG_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

const stats = {};
let allIcons = [];

for (const dir of subdirs) {
  assertSafeSegment(dir, 'svg subdir');
  const suffix = SUFFIX_MAP[dir] ?? '';
  const icons = await processDirectory(`${SVG_DIR}${path.sep}${dir}`, suffix, {
    isLogo: dir === 'logo',
  });
  stats[dir] = icons.length;
  allIcons.push(...icons);
}

allIcons = allIcons.sort();

// SVGR uses default exports; re-export as named exports for consumers.
const indexLines = [
  ...allIcons.map(
    (name) => `export { default as ${name} } from "./icons/${name}";`,
  ),
  '',
  '// Single type for all icon names',
  'export { iconManifest, type IconName } from "./manifest";',
  'export type IconComponent = import("react").ComponentType<import("react").SVGProps<SVGSVGElement>>;',
].filter(Boolean);
fs.writeFileSync(path.join(SRC_DIR, 'index.ts'), indexLines.join('\n') + '\n');

// Manifest for programmatic access
const manifestContent = [
  `export const iconManifest = ${JSON.stringify(allIcons)} as const;`,
  '',
  'export type IconName = (typeof iconManifest)[number];',
  '',
].join('\n');
fs.writeFileSync(path.join(SRC_DIR, 'manifest.ts'), manifestContent);

// Lightweight declarations for dependents (avoids loading thousands of .tsx in app tsc)
fs.mkdirSync(TYPES_DIR, { recursive: true });
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
  path.join(TYPES_DIR, 'index.d.ts'),
  consumerTypesLines.join('\n'),
);

// Storybook story
fs.writeFileSync(
  path.join(STORIES_DIR, 'AllIcons.stories.tsx'),
  generateStory(),
);

const breakdown = Object.entries(stats)
  .map(([dir, count]) => `${count} ${dir}`)
  .join(', ');
console.log(`Done – ${allIcons.length} icons (${breakdown})`);
console.log('  → src/index.ts');
console.log('  → src/manifest.ts');
console.log('  → types/index.d.ts');
console.log('  → stories/AllIcons.stories.tsx');
