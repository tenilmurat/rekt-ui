"use client";

import { Suspense, lazy, useMemo, type ComponentType } from "react";
import { pascalCase } from "@/lib/create/icon/icons";
import type { IconAnimationId } from "@/lib/create/icon/animation";

type IconComponentProps = {
  size?: number;
  animate?: boolean;
  animation?: string;
  loop?: boolean;
  loopDelay?: number;
};

/**
 * One Animate UI icon, fetched when it is chosen.
 *
 * Each icon is its own module, so the page ships the picker's names rather than
 * 259 components; `lazy` + a dynamic import pulls in only the one on screen.
 */
export function AnimateUiIcon({
  name,
  animation = "default",
  loop = true,
  loopDelay = 0.4,
  size = 200,
  runId = 0,
}: {
  name: string;
  animation?: IconAnimationId;
  loop?: boolean;
  loopDelay?: number;
  size?: number;
  /** Change it to play the animation again — the icon remounts. */
  runId?: number;
}) {
  const Icon = useMemo(
    () =>
      lazy(async () => {
        const mod = (await import(`@/components/animate-ui/icons/${name}`)) as Record<
          string,
          ComponentType<IconComponentProps>
        >;
        const component = mod[pascalCase(name)];
        return { default: component };
      }),
    [name],
  );

  return (
    <span className="flex items-center justify-center" style={{ color: "var(--ink)", minHeight: size }}>
      <Suspense fallback={<span style={{ width: size, height: size }} aria-hidden="true" />}>
        <Icon
          key={`${name}-${animation}-${loop}-${loopDelay}-${runId}`}
          size={size}
          animate
          animation={animation}
          loop={loop}
          loopDelay={loopDelay}
        />
      </Suspense>
    </span>
  );
}

export default AnimateUiIcon;
