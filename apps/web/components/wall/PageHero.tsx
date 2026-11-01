import type { ReactNode } from "react";

/** The opening of a wall page, aligned left with the wall below: a small pill, the headline, one line, an action, a footer row. */
export function PageHero({
  pill,
  title,
  lead,
  action,
  footer,
}: {
  pill?: ReactNode;
  title: ReactNode;
  lead: ReactNode;
  action?: ReactNode;
  /** A last row under a little more space, such as the tech the page's components work with. */
  footer?: ReactNode;
}) {
  return (
    <header className="animate-fade-up flex flex-col items-start px-[20px] pb-[96px] pt-[136px] text-left sm:pb-[128px] sm:pt-[184px]">
      {pill ? (
        <span
          className="mb-[20px] rounded-full border px-[12px] py-[5px] text-[12.5px]"
          style={{ borderColor: "var(--line)", color: "var(--ink-2)" }}
        >
          {pill}
        </span>
      ) : null}
      <h1
        className="text-[40px] font-semibold leading-[1] tracking-[-0.047em] sm:text-[64px]"
        style={{ color: "var(--ink-title)", textWrap: "balance" }}
      >
        {title}
      </h1>
      <p
        className="mt-[20px] max-w-[600px] text-[17px] leading-[1.35] tracking-[-0.03em] sm:text-[20px] sm:tracking-[-0.05em]"
        style={{ color: "var(--ink-2)", textWrap: "pretty" }}
      >
        {lead}
      </p>
      {action ? <div className="mt-[24px]">{action}</div> : null}
      {footer ? <div className="mt-[40px]">{footer}</div> : null}
    </header>
  );
}
