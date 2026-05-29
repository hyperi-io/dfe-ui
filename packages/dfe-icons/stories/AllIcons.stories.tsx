import React, { useState, useMemo } from "react";
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
          placeholder="Search icons…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <div className="icon-gallery-filters">
          {(["all", "outline", "filled"] as const).map((s) => (
            <button
              key={s}
              className={`icon-gallery-filter-btn${style === s ? " active" : ""}`}
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
