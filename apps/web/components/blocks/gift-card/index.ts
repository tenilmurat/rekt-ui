import type { ComponentType } from "react";
import type { ControlValues, UiBlock } from "@/lib/ui/types";
import { GiftCard } from "./GiftCard";
import { giftCardMeta } from "./meta";
import "./GiftCard.css";

export const giftCard: UiBlock = {
  ...giftCardMeta,
  component: GiftCard as ComponentType<ControlValues>,
};
