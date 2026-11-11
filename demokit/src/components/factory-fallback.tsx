"use client";
import { useId } from "react";
import type { Zone } from "../lib/lab-data";
export default function FactoryFallback({
  zones,
  selected,
  onSelect,
  layer,
  links,
  focus,
  blockedZone = "",
}: {
  zones: Zone[];
  selected: string;
  onSelect: (id: string) => void;
  layer: string;
  links: string[][];
  focus: string;
  blockedZone?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const project = (x: number, z: number, y = 0) => [
      440 + (x - z) * 8.4,
      185 + (x + z) * 3.8 - y * 10,
    ],
    pt = (x: number, z: number, y = 0) => project(x, z, y).join(",");
  const shades = {
    material: ["#a597bc", "#665974", "#827194"],
    production: ["#b0c0cf", "#5b7287", "#819aad"],
    support: ["#a9bfb7", "#536f69", "#789990"],
  };
  const box = (
    x: number,
    z: number,
    w: number,
    d: number,
    h: number,
    c: string[],
    base = 0,
  ) => {
    const a = pt(x - w / 2, z - d / 2, base + h),
      b = pt(x + w / 2, z - d / 2, base + h),
      cc = pt(x + w / 2, z + d / 2, base + h),
      dd = pt(x - w / 2, z + d / 2, base + h);
    return (
      <g>
        <polygon points={`${a} ${b} ${cc} ${dd}`} fill={c[0]} />
        <polygon
          points={`${dd} ${cc} ${pt(x + w / 2, z + d / 2, base)} ${pt(x - w / 2, z + d / 2, base)}`}
          fill={c[1]}
        />
        <polygon
          points={`${b} ${cc} ${pt(x + w / 2, z + d / 2, base)} ${pt(x + w / 2, z - d / 2, base)}`}
          fill={c[2]}
        />
      </g>
    );
  };
  const tank = (x: number, z: number, r: number, h: number, c: string[]) => {
    const [cx, cy] = project(x, z, h),
      [, by] = project(x, z, 0.2);
    return (
      <g>
        <path
          d={`M ${cx - r * 8} ${cy} L ${cx - r * 8} ${by} Q ${cx} ${by + 7} ${cx + r * 8} ${by} L ${cx + r * 8} ${cy}`}
          fill={c[2]}
          stroke={c[1]}
          strokeWidth=".6"
        />
        <ellipse cx={cx} cy={cy} rx={r * 8} ry={r * 3.4} fill={c[0]} />
        <ellipse cx={cx} cy={cy - 2} rx={r * 3} ry={r * 1.5} fill="#d8dce4" />
      </g>
    );
  };
  const chosen = zones.find((z) => z.id === selected),
    centre = chosen ? project(chosen.x, chosen.z) : [440, 220];
  const view =
    focus === "Site"
      ? "60 15 770 490"
      : `${centre[0] - (focus === "Area" ? 210 : 125)} ${centre[1] - (focus === "Area" ? 125 : 85)} ${focus === "Area" ? 420 : 250} ${focus === "Area" ? 270 : 180}`;
  return (
    <svg
      className="factory-fallback"
      viewBox={view}
      aria-label="Interactive isometric factory model; WebGL-free fallback"
    >
      <defs>
        <marker
          id={uid + "arrow"}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />
        </marker>
        <pattern
          id={uid + "grid"}
          width="24"
          height="24"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 24 0 L 0 0 0 24"
            fill="none"
            stroke="#262c3f"
            strokeWidth=".6"
          />
        </pattern>
        <filter id={uid + "shadow"}>
          <feDropShadow dx="0" dy="7" stdDeviation="8" floodOpacity=".35" />
        </filter>
      </defs>
      <rect
        x="-1000"
        y="-1000"
        width="4000"
        height="4000"
        fill={`url(#${uid}grid)`}
      />
      <g filter={`url(#${uid}shadow)`}>
        {box(5, 4, 65, 46, 0.7, ["#252d3e", "#171e2d", "#202638"], -1)}
        {box(5, 23, 61, 2.5, 0.1, ["#131c29", "#131c29", "#131c29"])}
      </g>
      {Array.from({ length: 15 }, (_, i) => (
        <path
          key={i}
          d={`M${project(-23 + i * 4, 23)}L${project(-21 + i * 4, 23)}`}
          stroke="#9a925e"
          strokeWidth="1.1"
        />
      ))}
      {layer !== "None" &&
        links.map(([a, b], i) => {
          const f = zones.find((z) => z.id === a),
            t = zones.find((z) => z.id === b);
          if (!f || !t) return null;
          const p1 = project(f.x, f.z, 0.2),
            p2 = project(t.x, t.z, 0.2);
          return (
            <path
              key={i}
              d={`M${p1} Q${(p1[0] + p2[0]) / 2} ${(p1[1] + p2[1]) / 2 - (layer === "Authority" ? 85 : layer === "Events" ? 65 : 0)} ${p2}`}
              stroke={
                layer === "Material" && b === blockedZone
                  ? "#fb887c"
                  : layer === "Authority"
                    ? "#c4afff"
                    : layer === "Events"
                      ? "#75d8e7"
                      : "#e8b269"
              }
              strokeWidth="2.2"
              strokeDasharray={
                layer === "Authority"
                  ? "1 4"
                  : layer === "Events" ||
                      (layer === "Material" && b === blockedZone)
                    ? "5 4"
                    : "none"
              }
              markerEnd={`url(#${uid}arrow)`}
              fill="none"
              opacity="1"
            />
          );
        })}
      {[...zones]
        .sort((a, b) => a.x + a.z - b.x - b.z)
        .map((zone) => {
          const c =
              selected === zone.id
                ? ["#d1b7f4", "#7b5a9f", "#a183bf"]
                : shades[zone.group],
            x = zone.x,
            z = zone.z,
            [lx, ly] = project(x, z + zone.d / 2),
            assets = [];
          if (zone.kind === "racks") {
            for (let i = -1; i <= 1; i++)
              for (let j = -1; j <= 1; j++)
                assets.push(
                  <g key={i + "," + j}>
                    {box(x + i * 2.2, z + j * 1.8, 1.7, 1.2, 2.5, [
                      "#77849c",
                      "#46556e",
                      "#617389",
                    ])}
                    {[0.5, 1.3, 2.1].map((h) => (
                      <g key={h}>
                        {box(x + i * 2.2, z + j * 1.8, 1.8, 1.3, 0.1, c, h)}
                        {box(
                          x + i * 2.2,
                          z + j * 1.8,
                          1.2,
                          1,
                          0.6,
                          ["#c4af8c", "#7b664f", "#aa926e"],
                          h + 0.1,
                        )}
                      </g>
                    ))}
                  </g>,
                );
          } else if (["process", "utilities", "weigh"].includes(zone.kind)) {
            for (let i = -1; i <= 1; i++)
              assets.push(
                <g key={i}>
                  {tank(
                    x + i * 2.7,
                    z - 1,
                    0.95,
                    zone.kind === "utilities" ? 3.4 : 2.7,
                    c,
                  )}
                  {box(x + i * 2.7, z + 1.3, 0.65, 0.75, 1.2, c)}
                </g>,
              );
            assets.push(
              <g key="belt">
                {box(
                  x,
                  z + 2,
                  zone.w - 2,
                  0.6,
                  0.45,
                  ["#b6bec9", "#576678", "#8292a2"],
                  0.3,
                )}
              </g>,
            );
          } else if (zone.kind === "pack")
            assets.push(
              <g key="pack">
                {box(x, z, 8, 1, 0.55, ["#a9b5c1", "#4f6578", "#7a91a1"], 0.3)}
                {box(x - 2, z, 1.8, 2, 2.4, c)}
                {box(x + 2, z, 0.7, 2.1, 2.7, c)}
                {[0, 1, 2].map((i) => (
                  <g key={i}>
                    {box(x - 3 + i * 2.6, z + 2.8, 1.5, 1.5, 1.1, [
                      "#c3a980",
                      "#80654c",
                      "#9f815e",
                    ])}
                  </g>
                ))}
              </g>,
            );
          else if (zone.kind === "dock") {
            for (let i = -1; i <= 1; i++)
              assets.push(
                <g key={i}>
                  {box(x + i * 2.4, z - 0.6, 1.8, 3, 1.8, c)}
                  {box(x + i * 2.4, z + 1.6, 1.7, 1.1, 1.3, [
                    "#97adc5",
                    "#3a506e",
                    "#677f9d",
                  ])}
                </g>,
              );
          } else
            assets.push(
              <g key="bld">
                {box(x, z - 1, zone.w - 1.5, 2.3, 2.1, c)}
                {[-1, 0, 1].map((i) => (
                  <g key={i}>
                    {box(x + i * 2.3, z + 1.8, 1.6, 1.1, 0.9, [
                      "#c2c5cf",
                      "#5b657d",
                      "#929db1",
                    ])}
                    {box(
                      x + i * 2.3,
                      z + 1.65,
                      1.1,
                      0.2,
                      0.6,
                      ["#95bfcc", "#3e6575", "#729eac"],
                      0.9,
                    )}
                  </g>
                ))}
              </g>,
            );
          return (
            <g
              key={zone.id}
              role="button"
              tabIndex={0}
              aria-label={"Select " + zone.name}
              className="svg-zone"
              onClick={() => onSelect(zone.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(zone.id);
                }
              }}
            >
              <title>{zone.name + " · " + zone.owner}</title>
              {box(
                x,
                z,
                zone.w,
                zone.d,
                0.18,
                selected === zone.id
                  ? ["#514267", "#3b2e50", "#56416d"]
                  : ["#333e50", "#242d40", "#2f3a4c"],
              )}
              <polygon
                points={`${pt(x - zone.w / 2, z - zone.d / 2, 0.2)} ${pt(x + zone.w / 2, z - zone.d / 2, 0.2)} ${pt(x + zone.w / 2, z + zone.d / 2, 0.2)} ${pt(x - zone.w / 2, z + zone.d / 2, 0.2)}`}
                fill="none"
                stroke={selected === zone.id ? "#d2b0ff" : "#536075"}
                strokeWidth={selected === zone.id ? 1.8 : 0.5}
              />
              {assets}
              <text
                x={lx}
                y={ly + 13}
                textAnchor="middle"
                fill={selected === zone.id ? "#ead4ff" : "#a8b3c7"}
                fontSize="8"
                fontFamily="system-ui"
                paintOrder="stroke"
                stroke="#131827"
                strokeWidth="3"
              >
                {zone.code} · {zone.short}
              </text>
            </g>
          );
        })}
      <text
        x="415"
        y="465"
        fill="#747f96"
        fontSize="9"
        fontFamily="monospace"
        letterSpacing="2"
      >
        SYNTHETIC SITE 01
      </text>
    </svg>
  );
}
