#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { transform } from "@svgr/core";
import svgrConfig from "../.svgrrc.json" with { type: "json" };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SVG_DIR = path.join(ROOT, "svg");
const SRC_DIR = path.join(ROOT, "src");
const ICONS_DIR = path.join(SRC_DIR, "icons");
const STORIES_DIR = path.join(ROOT, "stories");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toPascalCase(str) {
  return str
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

// ---------------------------------------------------------------------------
// Component generation via @svgr/core
// ---------------------------------------------------------------------------

async function generateComponentSource(name, svgString) {
  return transform(svgString, svgrConfig, { componentName: name });
}

// ---------------------------------------------------------------------------
// Directory processing
// ---------------------------------------------------------------------------

async function processDirectory(dir, suffix = "") {
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".svg")).sort();
  const icons = [];

  for (const file of files) {
    const baseName = file.replace(".svg", "");
    const componentName = "Icon" + toPascalCase(baseName) + suffix;
    const svgContent = fs.readFileSync(path.join(dir, file), "utf-8");

    try {
      const source = await generateComponentSource(componentName, svgContent);
      fs.writeFileSync(path.join(ICONS_DIR, `${componentName}.tsx`), source);
      icons.push(componentName);
    } catch (err) {
      console.warn(`  skip ${file}: ${err.message}`);
    }
  }

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
            <Icon width={24} height={24} />
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

console.log("Generating icon components…");

fs.rmSync(SRC_DIR, { recursive: true, force: true });
fs.mkdirSync(ICONS_DIR, { recursive: true });
fs.mkdirSync(STORIES_DIR, { recursive: true });

// Auto-discover all subdirectories under svg/.
// Only "filled" gets a "Filled" suffix; everything else has no suffix.
const SUFFIX_MAP = { filled: "Filled" };

const subdirs = fs
  .readdirSync(SVG_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

const stats = {};
let allIcons = [];

for (const dir of subdirs) {
  const suffix = SUFFIX_MAP[dir] ?? "";
  const icons = await processDirectory(path.join(SVG_DIR, dir), suffix);
  stats[dir] = icons.length;
  allIcons.push(...icons);
}

allIcons = allIcons.sort();

// SVGR uses default exports; re-export as named exports for consumers.
const indexLines = allIcons.map(
  (name) => `export { default as ${name} } from "./icons/${name}";`,
);
fs.writeFileSync(path.join(SRC_DIR, "index.ts"), indexLines.join("\n") + "\n");

// Manifest for programmatic access
const manifestContent = [
  `export const iconManifest = ${JSON.stringify(allIcons)} as const;`,
  "",
  "export type IconName = (typeof iconManifest)[number];",
  "",
].join("\n");
fs.writeFileSync(path.join(SRC_DIR, "manifest.ts"), manifestContent);

// Storybook story
fs.writeFileSync(
  path.join(STORIES_DIR, "AllIcons.stories.tsx"),
  generateStory(),
);

const breakdown = Object.entries(stats)
  .map(([dir, count]) => `${count} ${dir}`)
  .join(", ");
console.log(`Done – ${allIcons.length} icons (${breakdown})`);
console.log("  → src/index.ts");
console.log("  → src/manifest.ts");
console.log("  → stories/AllIcons.stories.tsx");
