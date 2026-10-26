"use client";

/**
 * Registry-ready wrappers for the Fancy Components text set.
 *
 * Their published demos are full-page (`w-dvw h-dvh`, page-size type). These keep the
 * same content and props but fit the preview canvas, and they honour the library's
 * `paused` flag: off-screen the animating component is unmounted and a static frame is
 * shown in its place, so no timers run out of view and the card is never blank.
 */

import { useEffect, useRef } from "react";
import { LayoutGroup, motion } from "motion/react";
import TextRotate from "@/components/previews/fancy/text/text-rotate";
import Typewriter from "@/components/previews/fancy/text/typewriter";
import ScrambleHover from "@/components/previews/fancy/text/scramble-hover";
import ScrambleIn, { type ScrambleInHandle } from "@/components/previews/fancy/text/scramble-in";
import type { PreviewProps } from "@/lib/registry/types";

const SPRING = { type: "spring", damping: 30, stiffness: 400 } as const;

/* #ff5941 is the chip colour from their own demo, kept so the entry matches the docs. */
const CHIP = "text-white px-2 md:px-3 bg-[#ff5941] overflow-hidden py-0.5 md:py-1 justify-center rounded-lg";

const ROTATE_TEXTS = ["work!", "fancy ✽", "right", "fast", "fun", "rock", "🕶️🕶️🕶️"];

export function TextRotatePreview({
  paused = false,
  startedAt: _startedAt,
  expanded,
  texts = ROTATE_TEXTS,
  ...rest
}: PreviewProps & { texts?: string[] }) {
  const size = expanded ? "text-[40px]" : "text-[28px]";

  return (
    <div
      className={`flex w-full items-center justify-center font-light ${size}`}
      style={{ color: "var(--ink)" }}
    >
      {paused ? (
        <p className="flex whitespace-pre">
          <span className="pt-1">Make it </span>
          <span className={CHIP}>{texts[0]}</span>
        </p>
      ) : (
        <LayoutGroup>
          <motion.p className="flex whitespace-pre" layout>
            <motion.span className="pt-1 md:pt-2" layout transition={SPRING}>
              Make it{" "}
            </motion.span>
            <TextRotate
              // their default renders a <p>; inside this paragraph it has to be inline
              as="span"
              texts={texts}
              mainClassName={CHIP}
              staggerFrom="last"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden pb-0.5 md:pb-1"
              transition={SPRING}
              rotationInterval={2000}
              {...rest}
            />
          </motion.p>
        </LayoutGroup>
      )}
    </div>
  );
}

const TYPE_TEXTS = [
  "experience",
  "dance",
  "love",
  "be alive",
  "create things that make the world a better place",
];

export function TypewriterPreview({
  paused = false,
  startedAt: _startedAt,
  expanded,
  text = TYPE_TEXTS,
  ...rest
}: PreviewProps & { text?: string[] }) {
  const size = expanded ? "text-[28px]" : "text-[20px]";

  return (
    <p
      className={`w-full whitespace-pre-wrap px-[8px] text-left font-normal ${size}`}
      style={{ color: "var(--ink)" }}
    >
      <span>{"We're born 🌞 to "}</span>
      {paused ? (
        <span className="text-yellow-500">{text[0]}</span>
      ) : (
        <Typewriter
          // default is a <div>, which cannot live inside the <p> around it
          as="span"
          text={text}
          speed={70}
          className="text-pretty text-yellow-500"
          waitTime={1500}
          deleteSpeed={40}
          cursorChar="_"
          {...rest}
        />
      )}
    </p>
  );
}

const MODELS = [
  "Llama 3.1 405B Instruct Turbo",
  "Llama 3.2 3B Instruct Turbo",
  "Gemma 2 27B",
  "Mistral 7B Instruct v0.3",
  "Mixtral 8x7B Instruct",
  "DeepSeek LLM Chat 67B",
  "Qwen 2.5 72B Instruct Turbo",
  "WizardLM 2 8x22B",
  "Nous Hermes 2 Mixtral",
  "StripedHyena Nous 7B",
  "DBRX Instruct",
  "MythoMax L2 13B",
  "SOLAR 10.7B Instruct",
  "Gemma 2B Instruct",
];

export function ScrambleHoverPreview({
  paused = false,
  startedAt: _startedAt,
  expanded,
  ...rest
}: PreviewProps) {
  const rows = expanded ? MODELS : MODELS.slice(0, 9);
  const size = expanded ? "text-[18px] leading-[30px]" : "text-[13px] leading-[22px]";

  return (
    <div
      className={`flex w-full flex-col items-end pr-[8px] text-right ${size}`}
      style={{ color: "var(--ink)" }}
    >
      {rows.map((model, index) =>
        paused ? (
          <div key={model}>{model}</div>
        ) : (
          <motion.div
            layout
            key={model}
            animate={{ opacity: [0, 1, 1], y: [10, 10, 0] }}
            transition={{ duration: 0.1, ease: "circInOut", delay: index * 0.05 + 0.5, times: [0, 0.2, 1] }}
          >
            <ScrambleHover
              text={model}
              scrambleSpeed={50}
              maxIterations={8}
              useOriginalCharsOnly
              className="cursor-pointer"
              {...rest}
            />
          </motion.div>
        ),
      )}
    </div>
  );
}

const TRACKS = [
  "1. One More Time (featuring Romanthony) - 5:20",
  "2. Aerodynamic - 3:27",
  "3. Digital Love - 4:58",
  "4. Harder, Better, Faster, Stronger - 3:45",
  "5. Crescendolls - 3:31",
  "6. Nightvision - 1:44",
  "7. Superheroes - 3:57",
  "8. High Life - 3:22",
  "9. Something About Us - 3:51",
  "10. Voyager - 3:47",
  "11. Veridis Quo - 5:44",
  "12. Short Circuit - 3:26",
  "13. Face to Face (featuring Todd Edwards) - 3:58",
  "14. Too Long (featuring Romanthony) - 10:00",
];

export function ScrambleInPreview({
  paused = false,
  startedAt,
  expanded,
  ...rest
}: PreviewProps) {
  const rows = expanded ? TRACKS : TRACKS.slice(0, 9);
  const size = expanded ? "text-[18px] leading-[30px]" : "text-[13px] leading-[22px]";
  const refs = useRef<(ScrambleInHandle | null)[]>([]);

  // Re-runs when the entry is restarted (preset switch, or coming back into view).
  useEffect(() => {
    if (paused) return;
    const timers = rows.map((_, index) =>
      window.setTimeout(() => refs.current[index]?.start(), index * 50),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [paused, startedAt, rows.length]);

  return (
    <div
      className={`flex w-full flex-col items-start pl-[8px] text-left ${size}`}
      style={{ color: "var(--ink)" }}
    >
      {rows.map((track, index) =>
        paused ? (
          <div key={track}>{track}</div>
        ) : (
          <ScrambleIn
            key={`${startedAt ?? 0}-${track}`}
            ref={(el) => {
              refs.current[index] = el;
            }}
            text={track}
            scrambleSpeed={25}
            scrambledLetterCount={5}
            autoStart={false}
            {...rest}
          />
        ),
      )}
    </div>
  );
}
