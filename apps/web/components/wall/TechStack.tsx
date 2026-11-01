import { useId, type ReactNode } from "react";

/** React: the atom, three orbits round a dot. */
function ReactLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      {[0, 60, 120].map((r) => (
        <ellipse key={r} cx="12" cy="12" rx="10.5" ry="4" transform={`rotate(${r} 12 12)`} />
      ))}
      <circle cx="12" cy="12" r="1.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** TypeScript: the square with "TS" cut out of it. */
function TypeScriptLogo() {
  const id = useId();
  return (
    <svg viewBox="0 0 24 24">
      <mask id={id}>
        <rect width="24" height="24" fill="white" />
        <text x="21" y="20.5" textAnchor="end" fontSize="11.5" fontWeight="700" letterSpacing="-0.4" fill="black" fontFamily="inherit">
          TS
        </text>
      </mask>
      <rect x="1" y="1" width="22" height="22" rx="1.5" fill="currentColor" mask={`url(#${id})`} />
    </svg>
  );
}

/** Next.js: the disc with its N, the right stem stopping short of the diagonal. */
function NextLogo() {
  const id = useId();
  return (
    <svg viewBox="0 0 24 24">
      <mask id={id}>
        <rect width="24" height="24" fill="white" />
        <path d="M8.6 16.2V7.8L18 19.6M15.4 7.8V13.4" fill="none" stroke="black" strokeWidth="1.6" strokeLinecap="square" />
      </mask>
      <circle cx="12" cy="12" r="11" fill="currentColor" mask={`url(#${id})`} />
    </svg>
  );
}

/** shadcn: two parallel slashes. */
function ShadcnLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M19.5 12 12 19.5M18 3.75 3.75 18" />
    </svg>
  );
}

const STACK: { name: string; logo: () => ReactNode }[] = [
  { name: "React", logo: ReactLogo },
  { name: "TypeScript", logo: TypeScriptLogo },
  { name: "Next.js", logo: NextLogo },
  { name: "shadcn", logo: ShadcnLogo },
];

/** What Rekt UI's components are built for, as a row of monochrome logos. */
export function TechStack() {
  return (
    // A very soft grey, mixed from the muted ink and the page colour, so it stays soft in both themes.
    <ul aria-label="Works with" className="flex items-center gap-[24px]" style={{ color: "color-mix(in srgb, var(--ink-3) 35%, var(--bg))" }}>
      {STACK.map(({ name, logo: Logo }) => (
        <li key={name} title={name} className="size-[20px] [&>svg]:size-full">
          <Logo />
          <span className="sr-only">{name}</span>
        </li>
      ))}
    </ul>
  );
}
