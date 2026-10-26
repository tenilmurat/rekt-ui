"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatedCode } from "@/components/create/code/AnimatedCode";
import { CodeAnimationSelector } from "@/components/create/code/CodeAnimationSelector";
import { CodeLanguageSelector } from "@/components/create/code/CodeLanguageSelector";
import { CodeSourceSelector, type CodeSource } from "@/components/create/code/CodeSourceSelector";
import { CopyCodeButton } from "@/components/create/controls/CopyCodeButton";
import { LineNumbersToggle } from "@/components/create/code/LineNumbersToggle";
import { ReplayButton } from "@/components/create/controls/ReplayButton";
import { SpeedControl } from "@/components/create/controls/SpeedControl";
import { SyntaxColorSelector } from "@/components/create/code/SyntaxColorSelector";
import { RektBadge } from "@/components/shell/ToolShell";
import { SPEED, type AnimationId } from "@/lib/create/code/animation";
import { EXAMPLES, type LanguageId } from "@/lib/create/code/languages";
import { buildUsageSnippet } from "@/lib/create/code/snippet";
import type { AccentId } from "@/lib/create/code/palette";

/** What this tool calls itself — in the panel header and in its toasts. */
const TOOL_NAME = "Code Block";

/** Typing shouldn't restart the animation on every keystroke. */
function useDebounced<T>(value: T, ms: number) {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setSettled(value), ms);
    return () => window.clearTimeout(id);
  }, [value, ms]);
  return settled;
}

export function RektCode({ expanded = false }: { expanded?: boolean }) {
  const [language, setLanguage] = useState<LanguageId>("javascript");
  const [source, setSource] = useState<CodeSource>("example");
  const [animation, setAnimation] = useState<AnimationId>("typewriter");
  const [speed, setSpeed] = useState<number>(SPEED.default);
  const [accent, setAccent] = useState<AccentId>("orange");
  const [customAccent, setCustomAccent] = useState("#0ea5b7");
  const [lineNumbers, setLineNumbers] = useState(true);
  const [pasted, setPasted] = useState("");
  const [runId, setRunId] = useState(0);

  const settledPaste = useDebounced(pasted, 400);

  // Generate Example follows the language; Paste keeps whatever was typed.
  const code = useMemo(() => {
    if (source === "example") return EXAMPLES[language];
    return settledPaste.trim().length ? settledPaste : EXAMPLES[language];
  }, [source, language, settledPaste]);

  const snippet = useMemo(
    () => buildUsageSnippet({ language, animation, speed, accent, customAccent, lineNumbers, code }),
    [language, animation, speed, accent, customAccent, lineNumbers, code],
  );

  const display = (
    <div
      className="relative overflow-hidden rounded-[16px] border"
      style={{
        backgroundColor: "var(--surface)",
        borderColor: "var(--line)",
        height: expanded ? "100%" : 360,
        flex: expanded ? "1 1 auto" : undefined,
        minWidth: 0,
      }}
    >
      {/* Full View puts the mark where a curated component carries its source
          badge: top left of the canvas, same offsets. */}
      {expanded ? (
        <div className="absolute left-[23px] top-[19px] z-10">
          <RektBadge size={30} />
        </div>
      ) : null}

      {/* same corner as the actions on a component entry */}
      <div className="absolute right-[19px] top-[19px] z-10 flex items-center gap-[8px]">
        <ReplayButton onReplay={() => setRunId((n) => n + 1)} />
        <CopyCodeButton snippet={snippet} name={TOOL_NAME} />
      </div>

      <div className="h-full w-full p-[24px] pt-[64px]">
        <AnimatedCode
          code={code}
          language={language}
          animation={animation}
          speed={speed}
          syntaxColor={accent === "custom" ? customAccent : accent}
          lineNumbers={lineNumbers}
          runId={runId}
        />
      </div>
    </div>
  );

  const filters = (
    <>
      <CodeLanguageSelector value={language} onChange={setLanguage} />

      <div className="flex flex-col gap-[10px]">
        <CodeSourceSelector value={source} onChange={setSource} />
        {source === "paste" ? (
          <>
            <label htmlFor="rekt-code-input" className="sr-only">
              Your code
            </label>
            <textarea
              id="rekt-code-input"
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              spellCheck={false}
              rows={expanded ? 8 : 6}
              placeholder={`Paste ${language} here — the example plays until you do.`}
              className="no-scrollbar w-full max-w-[720px] resize-y rounded-[10px] border p-[12px] font-mono text-[12px] leading-[20px]"
              style={{
                backgroundColor: "var(--surface-raised)",
                borderColor: "var(--line)",
                color: "var(--ink)",
              }}
            />
          </>
        ) : null}
      </div>

      <CodeAnimationSelector value={animation} onChange={setAnimation} />
      <SpeedControl value={speed} onChange={setSpeed} />
      <SyntaxColorSelector
        value={accent}
        custom={customAccent}
        onChange={setAccent}
        onCustomChange={setCustomAccent}
      />
      <LineNumbersToggle value={lineNumbers} onChange={setLineNumbers} />
    </>
  );

  // Full View: the display fills the screen and the filters move into their own
  // panel on the right, built from the same card, border and tokens as the rest.
  if (expanded) {
    return (
      <div className="flex h-full w-full gap-[8px]">
        {display}

        <aside
          aria-label="Code Block settings"
          className="no-scrollbar flex h-full w-[280px] shrink-0 flex-col gap-[20px] overflow-y-auto rounded-[16px] border p-[20px]"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--line)" }}
        >
          <div className="flex flex-col gap-[4px]">
            <p className="text-[13px] font-medium tracking-[-0.13px]" style={{ color: "var(--ink-title)" }}>
              {TOOL_NAME}
            </p>
            <p className="text-[12px] tracking-[-0.12px]" style={{ color: "var(--ink-3)" }}>
              by Rekt Studio
            </p>
          </div>

          <div className="h-px w-full" style={{ backgroundColor: "var(--line)" }} />

          {filters}
        </aside>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-[24px]">
      {display}
      <div className="flex flex-col gap-[20px]">{filters}</div>
    </div>
  );
}

export default RektCode;
