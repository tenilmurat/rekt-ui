import { rollingCounterMeta } from "@/components/blocks/rolling-counter/meta";
import { contentsHookMeta } from "@/components/blocks/contents-hook/meta";
import { contentsMarkerMeta } from "@/components/blocks/contents-marker/meta";
import { magnifyRulerMeta } from "@/components/blocks/magnify-ruler/meta";
import { stackGalleryMeta } from "@/components/blocks/stack-gallery/meta";
import { surpriseButtonMeta } from "@/components/blocks/surprise-button/meta";
import { morphLoaderMeta } from "@/components/blocks/morph-loader/meta";
import { iconBurstMeta } from "@/components/blocks/icon-burst/meta";
import { tabDockMeta } from "@/components/blocks/tab-dock/meta";
import { glitchSwitchMeta } from "@/components/blocks/glitch-switch/meta";
import { tiltCardMeta } from "@/components/blocks/tilt-card/meta";
import type { UiBlockMeta } from "@/lib/ui/types";

/**
 * Every free component the registry (/r/<id>.json) can hand out, read on the
 * server without loading any component code. Add a component's meta here when
 * it gets one. Pro components are not listed: their source is not in this repo.
 */
export const BLOCK_METAS: UiBlockMeta[] = [
  rollingCounterMeta,
  tiltCardMeta,
  contentsMarkerMeta,
  contentsHookMeta,
  magnifyRulerMeta,
  surpriseButtonMeta,
  morphLoaderMeta,
  iconBurstMeta,
  stackGalleryMeta,
  tabDockMeta,
  glitchSwitchMeta,
];

export const getMeta = (id: string) => BLOCK_METAS.find((m) => m.id === id);
