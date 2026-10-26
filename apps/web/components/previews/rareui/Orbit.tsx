"use client";

/* Source: Rare UI — https://www.rareui.com/ · MIT License.
   Adapted from the snippet supplied for this library; see NOTICE.md in this folder
   for what was changed and why. */

import { motion, useAnimationFrame, useMotionValue, useSpring, useTransform } from "motion/react";

export type OrbitProps = {
  /** Distance from the centre, in px. */
  radius?: number;
  /** Turns per second. */
  speed?: number;
  /** Diameter of the travelling dot, in px. */
  size?: number;
  /** Freeze the orbit (the library pauses previews that are off-screen). */
  paused?: boolean;
};

const TAU = Math.PI * 2;

export function Orbit({ radius = 120, speed = 1, size = 16, paused = false }: OrbitProps) {
  // Target angle advances every frame; the spring follows it, so the orbit eases
  // in from rest instead of snapping to full speed.
  const target = useMotionValue(0);
  const angle = useSpring(target, { stiffness: 80, damping: 20 });

  const x = useTransform(angle, (a) => Math.cos(a) * radius);
  const y = useTransform(angle, (a) => Math.sin(a) * radius);

  useAnimationFrame((_, delta) => {
    if (paused) return;
    target.set(target.get() + (delta / 1000) * speed * TAU);
  });

  return (
    <motion.div
      style={{ x, y, width: size, height: size }}
      className="rounded-full bg-current"
    />
  );
}

export default Orbit;
