"use client";

import { useMemo, useState } from "react";
import { AnimateUiIcon } from "@/components/create/icon/AnimateUiIcon";
import { IconAnimationSelector } from "@/components/create/icon/IconAnimationSelector";
import { IconLoopToggle } from "@/components/create/icon/IconLoopToggle";
import { IconPickerButton } from "@/components/create/icon/IconPickerButton";
import { CopyCodeButton } from "@/components/create/controls/CopyCodeButton";
import { ReplayButton } from "@/components/create/controls/ReplayButton";
import { RektBadge } from "@/components/shell/ToolShell";
import { LOOP_DELAY, animationHint, type IconAnimationId } from "@/lib/create/icon/animation";
import { ICON_COUNT } from "@/lib/create/icon/icons";
import { buildIconSnippet } from "@/lib/create/icon/snippet";

const TOOL_NAME = "Icon";

export function RektIcon({ expanded = false }: { expanded?: boolean }) {
  const [icon, setIcon] = useState("bell");
  const [animation, setAnimation] = useState<IconAnimationId>("default");
  const [loop, setLoop] = useState(true);
  const [loopDelay, setLoopDelay] = useState<number>(LOOP_DELAY.default);
  const [runId, setRunId] = useState(0);

  const size = expanded ? 280 : 200;

  const snippet = useMemo(
    () => buildIconSnippet({ icon, animation, loop, loopDelay, size }),
    [icon, animation, loop, loopDelay, size],
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
      {expanded ? (
        <div className="absolute left-[23px] top-[19px] z-10">
          <RektBadge size={30} />
        </div>
      ) : null}

      <div className="absolute right-[19px] top-[19px] z-10 flex items-center gap-[8px]">
        <ReplayButton onReplay={() => setRunId((n) => n + 1)} />
        <CopyCodeButton snippet={snippet} name={TOOL_NAME} />
      </div>

      <div className="flex h-full w-full items-center justify-center p-[24px] pt-[64px]">
        <AnimateUiIcon
          name={icon}
          animation={animation}
          loop={loop}
          loopDelay={loopDelay}
          size={size}
          runId={runId}
        />
      </div>
    </div>
  );

  const controls = (
    <>
      <IconPickerButton
        icon={icon}
        onChange={(name) => {
          setIcon(name);
          setRunId((n) => n + 1);
        }}
      />

      <IconAnimationSelector
        value={animation}
        onChange={(next) => {
          setAnimation(next);
          setRunId((n) => n + 1);
        }}
      />

      <IconLoopToggle
        value={loop}
        onChange={(next) => {
          setLoop(next);
          setRunId((n) => n + 1);
        }}
      />

      {loop ? (
        <div className="flex flex-col gap-[8px]">
          <div className="flex items-center gap-[8px]">
            <label
              htmlFor="rekt-icon-loop-delay"
              className="text-[12px] tracking-[-0.12px]"
              style={{ color: "var(--ink-3)" }}
            >
              Loop Delay
            </label>
            <span className="font-mono text-[12px]" style={{ color: "var(--ink-2)" }}>
              {loopDelay.toFixed(1)}s
            </span>
          </div>
          <input
            id="rekt-icon-loop-delay"
            type="range"
            min={LOOP_DELAY.min}
            max={LOOP_DELAY.max}
            step={LOOP_DELAY.step}
            value={loopDelay}
            onChange={(e) => setLoopDelay(Number(e.target.value))}
            className="h-[20px] w-full max-w-[220px] cursor-pointer"
            style={{ accentColor: "var(--ink)" }}
          />
        </div>
      ) : null}

      <p className="text-[12px]" style={{ color: "var(--ink-3)" }}>
        {animationHint(animation)} · {ICON_COUNT} icons from Animate UI
      </p>
    </>
  );

  if (expanded) {
    return (
      <div className="flex h-full w-full gap-[8px]">
        {display}

        <aside
          aria-label="Icon settings"
          className="no-scrollbar flex h-full w-[280px] shrink-0 flex-col gap-[20px] overflow-y-auto rounded-[16px] border p-[20px]"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--line)" }}
        >
          <div className="flex flex-col gap-[4px]">
            <p className="text-[13px] font-medium tracking-[-0.13px]" style={{ color: "var(--ink-title)" }}>
              {TOOL_NAME}
            </p>
            <p className="text-[12px] tracking-[-0.12px]" style={{ color: "var(--ink-3)" }}>
              by Rekt UI
            </p>
          </div>

          <div className="h-px w-full" style={{ backgroundColor: "var(--line)" }} />

          {controls}
        </aside>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-[24px]">
      {display}
      <div className="flex flex-col gap-[20px]">{controls}</div>
    </div>
  );
}

export default RektIcon;
