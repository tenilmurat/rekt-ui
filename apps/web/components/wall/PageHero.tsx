import type { ReactNode } from "react";

/** The centred opening of a wall page: a small pill, the headline, one line, an action. */
export function PageHero({
  pill,
  title,
  lead,
  action,
}: {
  pill?: ReactNode;
  title: ReactNode;
  lead: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="animate-fade-up flex flex-col items-center px-[20px] pb-[56px] pt-[88px] text-center">
      {pill ? (
        <span
          className="mb-[20px] rounded-full border px-[12px] py-[5px] text-[12.5px]"
          style={{ borderColor: "var(--line)", color: "var(--ink-2)" }}
        >
          {pill}
        </span>
      ) : null}
      <h1
        className="text-[32px] font-medium leading-[1.1] tracking-[-0.48px] sm:text-[40px]"
        style={{ color: "var(--ink-title)", textWrap: "balance" }}
      >
        {title}
      </h1>
      <p className="mt-[12px] max-w-[560px] text-[15px] leading-[1.55] sm:text-[16px]" style={{ color: "var(--ink-2)", textWrap: "pretty" }}>
        {lead}
      </p>
      {action ? <div className="mt-[24px]">{action}</div> : null}
    </header>
  );
}
