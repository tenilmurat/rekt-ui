"use client";

import { Bookmark } from "lucide-react";
import { useSession, type BookmarkKind } from "@/lib/session";

/** Save / unsave. Signed out, it opens the sign-in dialog instead. */
export function BookmarkButton({
  kind,
  id,
  label,
  className = "",
  round = false,
}: {
  kind: BookmarkKind;
  id: string;
  label: string;
  className?: string;
  /** The 38px round button that sits on wall cards. */
  round?: boolean;
}) {
  const { isBookmarked, toggleBookmark } = useSession();
  const saved = isBookmarked(kind, id);

  return (
    <button
      type="button"
      onClick={() => void toggleBookmark(kind, id, label)}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${label} from Saved` : `Save ${label}`}
      title={saved ? "Saved" : "Save"}
      className={
        round
          ? `control flex size-[38px] items-center justify-center rounded-full border active:scale-[0.94] ${className}`
          : `control flex items-center rounded-[8px] border p-[6px] active:scale-[0.96] ${className}`
      }
      style={{ backgroundColor: "var(--control-bg)", borderColor: "var(--control-line)" }}
    >
      <Bookmark
        size={16}
        strokeWidth={1.875}
        style={{ color: saved ? "var(--ink)" : "var(--icon)", fill: saved ? "var(--ink)" : "none" }}
        aria-hidden="true"
      />
    </button>
  );
}
