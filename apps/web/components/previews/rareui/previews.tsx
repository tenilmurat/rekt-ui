"use client";

/**
 * Registry-ready wrapper for the Rare UI orbit: a client boundary (so the registry,
 * which server components import, only holds a reference) that also draws the path
 * and centre mark so the motion reads on the preview canvas.
 */

import { CodeBlock, type CodeBlockProps } from "@/components/previews/rareui/CodeBlock";
import { Orbit } from "@/components/previews/rareui/Orbit";
import type { PreviewProps } from "@/lib/registry/types";

/** What the block shows by default: the orbit component, one page up. */
export const ORBIT_SNIPPET = `import { motion, useAnimationFrame, useMotionValue, useSpring, useTransform } from "motion/react";

export function Orbit({ radius = 120, speed = 1 }) {
  const target = useMotionValue(0);
  const angle = useSpring(target, { stiffness: 80, damping: 20 });

  const x = useTransform(angle, (a) => Math.cos(a) * radius);
  const y = useTransform(angle, (a) => Math.sin(a) * radius);

  useAnimationFrame((_, delta) => {
    target.set(target.get() + (delta / 1000) * speed * Math.PI * 2);
  });

  return <motion.div style={{ x, y }} className="size-4 rounded-full bg-current" />;
}`;

/**
 * The code block in the library.
 *
 * In the list it keeps its own frame — filename header, copy button — and no
 * height is imposed, so nothing scrolls inside it. In Full View the canvas is
 * the frame, so the block renders bare and sits centred on it.
 */
export function CodeBlockPreview({
  paused: _paused,
  startedAt: _startedAt,
  expanded,
  code = ORBIT_SNIPPET,
  language = "tsx",
  filename = "orbit.tsx",
  ...rest
}: PreviewProps & Partial<CodeBlockProps>) {
  return (
    // The block is centred on the canvas as a block, but its text stays
    // left-aligned: code reads from its first character, and a long line
    // scrolls rather than being clipped at both ends.
    <div className="w-full" style={{ maxWidth: expanded ? 900 : 620 }}>
      <CodeBlock
        code={code}
        language={language}
        filename={filename}
        showFrame={!expanded}
        showCopyButton={!expanded}
        {...rest}
      />
    </div>
  );
}

export function OrbitPreview({
  paused = false,
  radius = 96,
  speed = 0.4,
  size = 16,
  showPath = true,
}: PreviewProps & { radius?: number; speed?: number; size?: number; showPath?: boolean }) {
  const box = radius * 2 + size;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: box, height: box, color: "var(--ink)" }}
    >
      {showPath ? (
        <div
          aria-hidden="true"
          className="absolute rounded-full border border-dashed"
          style={{ width: radius * 2, height: radius * 2, borderColor: "var(--line-strong)" }}
        />
      ) : null}

      <div
        aria-hidden="true"
        className="absolute size-[6px] rounded-full"
        style={{ backgroundColor: "var(--ink-3)" }}
      />

      <Orbit radius={radius} speed={speed} size={size} paused={paused} />
    </div>
  );
}
