"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bookmark, CreditCard, LogOut, Sparkles } from "lucide-react";
import { Icon } from "@/components/shell/Icon";
import { ThemeToggle } from "@/components/shell/ThemeToggle";
import { getPlan } from "@/lib/plans";
import { useSession } from "@/lib/session";

/** Height of the header; the sidebar and Full View sit below it. */
export const HEADER_HEIGHT = 56;

const NAV = [
  { href: "/good-designs", label: "Good designs of X", short: "Designs" },
  { href: "/pricing", label: "Pricing" },
];

/** Pages that aren't UI. Everything else (categories, tools) is the UI section. */
const NOT_UI = ["/good-designs", "/pricing", "/saved", "/account"];

export function SiteHeader() {
  const pathname = usePathname();
  const isUi = !NOT_UI.some((p) => pathname.startsWith(p));

  return (
    <header
      className="sticky top-0 z-40 flex w-full items-center justify-between border-b px-[16px] sm:px-[24px]"
      style={{ height: HEADER_HEIGHT, backgroundColor: "var(--bg)", borderColor: "var(--line)" }}
    >
      <div className="flex items-center gap-[12px] sm:gap-[24px]">
        <Link href="/" aria-label="Rekt Studio library, home" className="flex items-center">
          <Icon name="logo" size={23} color="var(--ink)" className="h-[20px] w-[23px]" />
        </Link>
        <nav aria-label="Main" className="flex items-center gap-[2px]">
          <NavLink href="/" label="UI" active={isUi} />
          {NAV.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} short={item.short} active={pathname.startsWith(item.href)} />
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-[8px]">
        {/* UI pages carry the toggle in their sidebar, as in the Figma frame. */}
        {isUi ? null : <ThemeToggle />}
        <AccountArea />
      </div>
    </header>
  );
}

function NavLink({ href, label, short, active }: { href: string; label: string; short?: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className="control-quiet whitespace-nowrap rounded-[8px] px-[8px] py-[6px] text-[13px] tracking-[-0.026px] sm:px-[10px]"
      style={{
        backgroundColor: active ? "var(--surface)" : "var(--control-bg)",
        color: active ? "var(--ink)" : "var(--control-fg)",
      }}
    >
      {short ? (
        <>
          <span className="sm:hidden">{short}</span>
          <span className="hidden sm:inline">{label}</span>
        </>
      ) : (
        label
      )}
    </Link>
  );
}

function AccountArea() {
  const { status, account, plan, openSignIn, signOut } = useSession();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (status === "loading") {
    return <span aria-hidden="true" className="h-[30px] w-[72px] rounded-[8px]" style={{ backgroundColor: "var(--surface)" }} />;
  }

  if (status !== "signed-in" || !account) {
    return (
      <button
        type="button"
        onClick={() => openSignIn()}
        className="h-[30px] whitespace-nowrap rounded-[8px] px-[12px] text-[13px] font-medium transition-transform active:scale-[0.96]"
        style={{ backgroundColor: "var(--ink)", color: "var(--bg)" }}
      >
        Sign in
      </button>
    );
  }

  const initial = (account.name ?? account.email).charAt(0).toUpperCase();

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="control flex size-[30px] items-center justify-center overflow-hidden rounded-full border text-[12px] font-medium active:scale-[0.96]"
        style={{ backgroundColor: "var(--control-bg)", borderColor: "var(--control-line)", color: "var(--ink)" }}
      >
        {account.avatarUrl ? (
          // Google's picture, shown from Google's servers; never copied here.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={account.avatarUrl} alt="" className="size-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          initial
        )}
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Account"
          className="animate-pop-in absolute right-0 top-[38px] z-50 flex w-[240px] origin-top-right flex-col rounded-[12px] border p-[6px]"
          style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--line)", boxShadow: "var(--shadow-overlay)" }}
        >
          <div className="flex flex-col gap-[2px] px-[10px] pb-[8px] pt-[6px]">
            <p className="truncate text-[13px] font-medium" style={{ color: "var(--ink)" }}>
              {account.name ?? account.email}
            </p>
            <p className="truncate text-[12px]" style={{ color: "var(--ink-3)" }}>
              {getPlan(plan).name} plan{account.name ? ` · ${account.email}` : ""}
            </p>
          </div>
          <div className="my-[2px] h-px" style={{ backgroundColor: "var(--line)" }} />
          {plan === "free" ? <MenuLink href="/pricing" icon={<Sparkles size={15} strokeWidth={1.875} />} label="Upgrade to Pro" /> : null}
          <MenuLink href="/saved" icon={<Bookmark size={15} strokeWidth={1.875} />} label="Saved" />
          <MenuLink href="/account" icon={<CreditCard size={15} strokeWidth={1.875} />} label="Account & billing" />
          <div className="my-[2px] h-px" style={{ backgroundColor: "var(--line)" }} />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              void signOut();
            }}
            className="control-quiet flex items-center gap-[10px] rounded-[8px] px-[10px] py-[7px] text-left text-[13px]"
            style={{ backgroundColor: "var(--control-bg)", color: "var(--control-fg)" }}
          >
            <LogOut size={15} strokeWidth={1.875} />
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}

function MenuLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="control-quiet flex items-center gap-[10px] rounded-[8px] px-[10px] py-[7px] text-[13px]"
      style={{ backgroundColor: "var(--control-bg)", color: "var(--control-fg)" }}
    >
      {icon}
      {label}
    </Link>
  );
}
