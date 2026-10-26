"use client";

import Link from "next/link";
import { DesignCard } from "@/components/good-designs/DesignCard";
import { AccountGate } from "@/components/site/AccountGate";
import { BookmarkButton } from "@/components/site/BookmarkButton";
import { getDesign } from "@/lib/good-designs";
import { UI_CATEGORIES, BLOCKS } from "@/lib/ui/catalog";
import { useSession } from "@/lib/session";

const categoryName = (id: string) => UI_CATEGORIES.find((c) => c.id === id)?.label ?? "Component";

export default function SavedPage() {
  return (
    <AccountGate title="Saved" lead="Components and designs you kept." signedOutText="Sign in to see what you've saved.">
      <SavedLists />
    </AccountGate>
  );
}

function SavedLists() {
  const { bookmarks } = useSession();
  const ids = (kind: string) => [...bookmarks].filter((k) => k.startsWith(`${kind}:`)).map((k) => k.slice(kind.length + 1));

  // Bookmarks of items that were since removed from the library are skipped.
  const components = ids("component").flatMap((id) => BLOCKS.filter((block) => block.id === id));
  const designs = ids("design").flatMap((id) => getDesign(id) ?? []);

  if (!components.length && !designs.length) {
    return (
      <p className="text-[14px]" style={{ color: "var(--ink-2)" }}>
        Nothing saved yet. Press the bookmark on any{" "}
        <Link href="/" className="underline underline-offset-2" style={{ color: "var(--ink)" }}>
          component
        </Link>{" "}
        or{" "}
        <Link href="/good-designs" className="underline underline-offset-2" style={{ color: "var(--ink)" }}>
          design
        </Link>{" "}
        to keep it here.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-[48px]">
      {components.length ? (
        <section aria-labelledby="saved-components" className="flex flex-col gap-[12px]">
          <h2 id="saved-components" className="text-[15px] font-medium" style={{ color: "var(--ink-title)" }}>
            Components <span style={{ color: "var(--ink-3)" }}>{components.length}</span>
          </h2>
          <ul className="flex max-w-[640px] flex-col border-t" style={{ borderColor: "var(--line)" }}>
            {components.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-[16px] border-b py-[12px]" style={{ borderColor: "var(--line)" }}>
                <Link href={`/?c=${item.id}`} className="flex min-w-0 flex-col gap-[2px]">
                  <span className="text-[13px] font-medium" style={{ color: "var(--ink)" }}>
                    {item.title}
                  </span>
                  <span className="truncate text-[12px]" style={{ color: "var(--ink-3)" }}>
                    {categoryName(item.category)} · {item.description}
                  </span>
                </Link>
                <BookmarkButton kind="component" id={item.id} label={item.title} className="shrink-0" />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {designs.length ? (
        <section aria-labelledby="saved-designs" className="flex flex-col gap-[16px]">
          <h2 id="saved-designs" className="text-[15px] font-medium" style={{ color: "var(--ink-title)" }}>
            Designs <span style={{ color: "var(--ink-3)" }}>{designs.length}</span>
          </h2>
          <div className="grid grid-cols-1 gap-x-[20px] gap-y-[32px] sm:grid-cols-2 lg:grid-cols-3">
            {designs.map((design) => (
              <DesignCard key={design.id} design={design} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
