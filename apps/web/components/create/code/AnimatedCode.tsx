"use client";

import { memo, useEffect, useMemo, useState, type CSSProperties } from "react";
import { useTheme } from "next-themes";
import { Prism, useTokenize, type Token } from "prism-react-renderer";
import {
  RATE_PER_SECOND,
  SCRAMBLE_EDGE,
  countsLineChars,
  countsLines,
  longestLine,
  scrambleChar,
  scrambles,
  useReveal,
  usePrefersReducedMotion,
  type AnimationId,
} from "@/lib/create/code/animation";
import { prismLanguage, languageLabel, type LanguageId } from "@/lib/create/code/languages";
import { ACCENTS, buildPalette, buildPrismTheme, type AccentId, type Mode } from "@/lib/create/code/palette";

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** Where a line sits in the two animations that work line by line. */
type LineState = "shown" | "pending" | "active" | "ahead";

export type AnimatedCodeProps = {
  code: string;
  language: LanguageId;
  animation: AnimationId;
  /** One number for every animation; mapped to that animation's own unit. */
  speed: number;
  /** An accent preset id ("orange") or any hex ("#0ea5b7"). */
  syntaxColor: AccentId | string;
  lineNumbers?: boolean;
  /** Change it to play the run again; nothing else about the render changes. */
  runId?: number;
  className?: string;
};

/**
 * One line of code.
 *
 * Memoised on purpose: `chars` is clamped to this line's own length and `churn`
 * is zeroed once the line is finished, so a line that has landed stops
 * re-rendering for the rest of the run even though the counter above it keeps
 * climbing. That is what keeps a long snippet smooth.
 */
const CodeLine = memo(function CodeLine({
  tokens,
  lineIndex,
  chars,
  churn,
  animation,
  state,
  lineNumbers,
  gutter,
  wash,
  styleFor,
}: {
  tokens: Token[];
  lineIndex: number;
  chars: number;
  churn: number;
  animation: AnimationId;
  state: LineState;
  lineNumbers: boolean;
  gutter: string;
  wash: string;
  styleFor: (types: string[]) => CSSProperties;
}) {
  let cursor = 0;

  const rendered = tokens.map((token, tokenIndex) => {
    const content = token.content;
    const start = cursor;
    cursor += content.length;
    const style = styleFor(token.types);

    if (animation === "typewriter") {
      const shown = clamp(chars - start, 0, content.length);
      const rest = content.slice(shown);
      return (
        <span key={tokenIndex} style={style}>
          {content.slice(0, shown)}
          {rest ? <span style={{ visibility: "hidden" }}>{rest}</span> : null}
        </span>
      );
    }

    if (animation === "scramble") {
      const shown = clamp(chars - start, 0, content.length);
      let pending = "";
      for (let i = shown; i < content.length; i += 1) {
        const char = content[i];
        pending += /\s/.test(char) ? char : scrambleChar(churn * 31 + lineIndex * 131 + start + i * 7);
      }
      return (
        <span key={tokenIndex} style={style}>
          {content.slice(0, shown)}
          {pending}
        </span>
      );
    }

    if (animation === "scramble-in") {
      // typing and scrambling at once: settled text, a churning edge, then space
      const typed = clamp(chars - start, 0, content.length);
      const settled = clamp(chars - SCRAMBLE_EDGE - start, 0, content.length);
      let edge = "";
      for (let i = settled; i < typed; i += 1) {
        const char = content[i];
        edge += /\s/.test(char) ? char : scrambleChar(churn * 17 + lineIndex * 97 + start + i * 5);
      }
      const rest = content.slice(typed);
      return (
        <span key={tokenIndex} style={style}>
          {content.slice(0, settled)}
          {edge}
          {rest ? <span style={{ visibility: "hidden" }}>{rest}</span> : null}
        </span>
      );
    }

    if (animation === "word-reveal") {
      const here = start < chars;
      return (
        <span
          key={tokenIndex}
          style={{ ...style, opacity: here ? 1 : 0, transition: "opacity 160ms var(--ease-out-strong)" }}
        >
          {content}
        </span>
      );
    }

    return (
      <span key={tokenIndex} style={style}>
        {content}
      </span>
    );
  });

  const hidden = state === "pending";

  return (
    <div
      className="flex min-w-full rounded-[4px] px-[2px]"
      style={{
        backgroundColor: state === "active" ? wash : "transparent",
        opacity: hidden ? 0 : state === "ahead" ? 0.4 : 1,
        transform: hidden ? "translateY(4px)" : "none",
        transition:
          "opacity 220ms var(--ease-out-strong), transform 220ms var(--ease-out-strong), background-color 220ms var(--ease-out-strong)",
      }}
    >
      {lineNumbers ? (
        <span
          aria-hidden="true"
          className="mr-[16px] shrink-0 select-none text-right"
          style={{ width: gutter, color: "var(--ink-2)" }}
        >
          {lineIndex + 1}
        </span>
      ) : null}
      <span className="whitespace-pre pr-[8px]">{rendered}</span>
    </div>
  );
});

/**
 * The animated code surface. Prism tokenises the snippet once; the animation
 * only decides how much of it is shown — so highlighting is identical at every
 * frame, and the layout never jumps: characters that have not arrived yet still
 * occupy their space.
 */
export function AnimatedCode({
  code,
  language,
  animation,
  speed,
  syntaxColor,
  lineNumbers = true,
  runId = 0,
  className,
}: AnimatedCodeProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const mode: Mode = mounted && resolvedTheme === "dark" ? "dark" : "light";

  const accent = syntaxColor.startsWith("#")
    ? syntaxColor
    : (ACCENTS.find((a) => a.id === syntaxColor)?.hex ?? "#f75001");

  const palette = useMemo(() => buildPalette(accent, mode), [accent, mode]);
  const theme = useMemo(() => buildPrismTheme(palette), [palette]);

  /** token types -> style, resolved once and cached per type signature. */
  const styleFor = useMemo(() => {
    const byType = new Map<string, CSSProperties>();
    for (const entry of theme.styles) {
      for (const type of entry.types) {
        byType.set(type, { ...(byType.get(type) ?? {}), ...entry.style });
      }
    }
    const cache = new Map<string, CSSProperties>();
    return (types: string[]) => {
      const key = types.join("|");
      const hit = cache.get(key);
      if (hit) return hit;
      let style: CSSProperties = { color: theme.plain.color };
      for (const type of types) {
        const found = byType.get(type);
        if (found) style = { ...style, ...found };
      }
      cache.set(key, style);
      return style;
    };
  }, [theme]);

  const prismLang = prismLanguage(language);
  const grammar = Prism.languages[prismLang] ?? Prism.languages.javascript;
  const tokens = useTokenize({ prism: Prism, code, grammar, language: prismLang });

  const reduced = usePrefersReducedMotion();
  const longest = useMemo(() => longestLine(code), [code]);

  // Every animation counts in its own unit: whole lines, characters across the
  // snippet, or — for Scramble In — characters inside each line at once. Scramble
  // In runs SCRAMBLE_EDGE past the longest line so the churning edge can run off
  // the end and leave settled text behind it.
  const total = countsLines(animation)
    ? tokens.length
    : countsLineChars(animation)
      ? longest + SCRAMBLE_EDGE
      : code.length;

  const { revealed, churn } = useReveal({
    total,
    rate: RATE_PER_SECOND[animation] * speed,
    runId,
    animate: !reduced,
  });

  const gutter = `${String(tokens.length).length}ch`;
  const activeLine = Math.min(tokens.length - 1, revealed);
  const running = revealed < total;
  const churning = scrambles(animation) && running && !reduced;

  let offset = 0; // characters before this line, for the snippet-wide counters

  return (
    <div
      tabIndex={0}
      role="region"
      aria-label={`${languageLabel(language)} sample, ${animation.replace("-", " ")}`}
      className={`no-scrollbar h-full w-full overflow-auto ${className ?? ""}`}
    >
      <pre className="w-max min-w-full font-mono text-[13px] leading-[22px] [tab-size:2]">
        {tokens.map((line, lineIndex) => {
          const length = line.reduce((n, token) => n + token.content.length, 0);
          const lineStart = offset;
          offset += length + 1; // + the newline

          // Scramble In gives every line the same counter, so they all run
          // together; the others share one counter across the whole snippet.
          // A line is done once its edge has drained past its last character.
          const span = countsLineChars(animation) ? length + SCRAMBLE_EDGE : length;
          const chars = countsLineChars(animation)
            ? clamp(revealed, 0, span)
            : clamp(revealed - lineStart, 0, span);

          let state: LineState = "shown";
          if (animation === "line-reveal") state = lineIndex < revealed ? "shown" : "pending";
          if (animation === "highlight" && running) {
            state = lineIndex === activeLine ? "active" : lineIndex > activeLine ? "ahead" : "shown";
          }

          return (
            <CodeLine
              key={lineIndex}
              tokens={line}
              lineIndex={lineIndex}
              chars={chars}
              churn={churning && chars < span ? churn : 0}
              animation={animation}
              state={state}
              lineNumbers={lineNumbers}
              gutter={gutter}
              wash={palette.wash}
              styleFor={styleFor}
            />
          );
        })}
      </pre>
    </div>
  );
}

export default AnimatedCode;
