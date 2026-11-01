"use client";

import { useEffect, useState } from "react";

/** How long a glitch runs, and when in it the word changes, in ms. */
const GLITCH = 420;
const SWAP_AT = 200;

/**
 * A word that glitches into the next one every few seconds: two slices of it
 * tear sideways in red and cyan, and the word changes halfway through.
 * Screen readers hear only the first word, once.
 */
export function GlitchWord({ words, interval = 3000 }: { words: string[]; interval?: number }) {
  const [index, setIndex] = useState(0);
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    if (words.length < 2) return;
    const timers: number[] = [];
    const tick = window.setInterval(() => {
      setGlitching(true);
      timers.push(
        window.setTimeout(() => setIndex((i) => (i + 1) % words.length), SWAP_AT),
        window.setTimeout(() => setGlitching(false), GLITCH),
      );
    }, interval);
    return () => {
      window.clearInterval(tick);
      timers.forEach(window.clearTimeout);
    };
  }, [words.length, interval]);

  const word = words[index] ?? "";
  return (
    <>
      <span className="sr-only">{words[0]}</span>
      <span className="glitch-word" data-text={word} data-glitch={glitching} aria-hidden="true">
        {word}
      </span>
    </>
  );
}
