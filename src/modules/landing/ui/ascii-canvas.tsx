"use client";

import { useEffect, useRef } from "react";

export type AsciiPoint = { x: number; y: number; depth: number; char: string };
type Frame = (
  size: { width: number; height: number },
  time: number,
) => {
  points: AsciiPoint[];
  font: string;
  /** Opacity for a depth between 0 (back) and 1 (front). */
  alpha: (depth: number) => number;
};

/**
 * Template ASCII animations on one engine: drawn in the text colour, paused off screen,
 * a single still frame when the visitor prefers reduced motion.
 */
export function AsciiCanvas({ frame, speed }: { frame: Frame; speed: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let time = 0;
    let raf = 0;
    let visible = false;

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const { points, font, alpha } = frame(rect, time);
      const color = getComputedStyle(canvas).color;
      context.clearRect(0, 0, rect.width, rect.height);
      context.font = font;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = color;
      points.sort((a, b) => a.depth - b.depth);
      for (const point of points) {
        context.globalAlpha = alpha(point.depth);
        context.fillText(point.char, point.x, point.y);
      }
      context.globalAlpha = 1;
    };

    const loop = () => {
      draw();
      time += speed;
      raf = visible ? requestAnimationFrame(loop) : 0;
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (still) draw();
      else if (visible && !raf) raf = requestAnimationFrame(loop);
    });

    resize();
    observer.observe(canvas);
    window.addEventListener("resize", resize);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, [frame, speed]);

  return <canvas ref={canvasRef} aria-hidden className="block h-full w-full" />;
}
