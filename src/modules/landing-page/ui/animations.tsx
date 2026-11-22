"use client";

import { AsciiCanvas, type AsciiPoint } from "./ascii-canvas";

const BLOCKS = "░▒▓█▀▄▌▐│─┤├┴┬╭╮╰╯";
const DOTS = "·∘○◯◌●◉";

type Vec = { x: number; y: number; z: number };
const rotate = ({ x, y, z }: Vec, ax: number, ay: number, az: number): Vec => {
  const x1 = x * Math.cos(ay) - z * Math.sin(ay);
  const z1 = x * Math.sin(ay) + z * Math.cos(ay);
  const y2 = y * Math.cos(ax) - z1 * Math.sin(ax);
  const z2 = y * Math.sin(ax) + z1 * Math.cos(ax);
  return {
    x: x1 * Math.cos(az) - y2 * Math.sin(az),
    y: x1 * Math.sin(az) + y2 * Math.cos(az),
    z: z2,
  };
};
const glyph = (chars: string, depth: number) =>
  chars[
    Math.min(
      chars.length - 1,
      Math.max(0, Math.floor(depth * (chars.length - 1))),
    )
  ];

/** Hero: a rotating sphere of block characters. */
const sphere = (
  { width, height }: { width: number; height: number },
  time: number,
) => {
  const radius = Math.min(width, height) * 0.525;
  const points: AsciiPoint[] = [];
  for (let phi = 0; phi < Math.PI * 2; phi += 0.15) {
    for (let theta = 0; theta < Math.PI; theta += 0.15) {
      const p = rotate(
        {
          x: Math.sin(theta) * Math.cos(phi + time * 0.5),
          y: Math.sin(theta) * Math.sin(phi + time * 0.5),
          z: Math.cos(theta),
        },
        time * 0.2,
        time * 0.3,
        0,
      );
      const depth = (p.z + 1) / 2;
      points.push({
        x: width / 2 + p.x * radius,
        y: height / 2 + p.y * radius,
        depth,
        char: glyph(BLOCKS, depth),
      });
    }
  }
  return {
    points,
    font: "12px monospace",
    alpha: (depth: number) => 0.2 + depth * 0.8,
  };
};

const TETRA: Vec[] = [
  { x: 0, y: 1, z: 0 },
  { x: -0.943, y: -0.333, z: -0.5 },
  { x: 0.943, y: -0.333, z: -0.5 },
  { x: 0, y: -0.333, z: 1 },
];
const EDGES = [
  [0, 1],
  [0, 2],
  [0, 3],
  [1, 2],
  [2, 3],
  [3, 1],
];
const FACES = [
  [0, 1, 2],
  [0, 2, 3],
  [0, 3, 1],
  [1, 3, 2],
];

/** Call to action: a rotating tetrahedron. */
const tetrahedron = (
  { width, height }: { width: number; height: number },
  time: number,
) => {
  const scale = Math.min(width, height) * 0.7;
  const points: AsciiPoint[] = [];
  const add = (v: Vec) => {
    const p = rotate(v, time * 0.3, time * 0.4, time * 0.2);
    const depth = (p.z + 1.5) / 3;
    points.push({
      x: width / 2 + p.x * scale,
      y: height / 2 - p.y * scale,
      depth,
      char: glyph(BLOCKS, depth),
    });
  };
  for (const [i, j] of EDGES) {
    for (let t = 0; t <= 1; t += 0.05) {
      const [a, b] = [TETRA[i], TETRA[j]];
      add({
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        z: a.z + (b.z - a.z) * t,
      });
    }
  }
  for (const [i, j, k] of FACES) {
    const [a, b, c] = [TETRA[i], TETRA[j], TETRA[k]];
    for (let u = 0; u <= 1; u += 0.12) {
      for (let v = 0; v <= 1 - u; v += 0.12) {
        const w = 1 - u - v;
        add({
          x: a.x * u + b.x * v + c.x * w,
          y: a.y * u + b.y * v + c.y * w,
          z: a.z * u + b.z * v + c.z * w,
        });
      }
    }
  }
  return {
    points,
    font: "18px monospace",
    alpha: (depth: number) => Math.min(0.9, 0.15 + depth * 0.75),
  };
};

/** Footer: interfering waves of dots. */
const wave = (
  { width, height }: { width: number; height: number },
  time: number,
) => {
  const cols = Math.floor(width / 20);
  const rows = Math.floor(height / 20);
  const points: AsciiPoint[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const combined =
        (Math.sin(x * 0.2 + time * 2) * Math.cos(y * 0.15 + time) +
          Math.sin((x + y) * 0.1 + time * 1.5) +
          Math.cos(x * 0.1 - y * 0.1 + time * 0.8)) /
        3;
      const depth = (combined + 1) / 2;
      points.push({
        x: (x + 0.5) * (width / cols),
        y: (y + 0.5) * (height / rows),
        depth,
        char: glyph(DOTS, depth),
      });
    }
  }
  return {
    points,
    font: "14px monospace",
    alpha: (depth: number) => 0.15 + depth * 0.5,
  };
};

export const AnimatedSphere = () => <AsciiCanvas frame={sphere} speed={0.02} />;
export const AnimatedTetrahedron = () => (
  <AsciiCanvas frame={tetrahedron} speed={0.015} />
);
export const AnimatedWave = () => <AsciiCanvas frame={wave} speed={0.03} />;
