/** Languages REKT / CODE can animate, with the short example each one shows. */
export type LanguageId =
  | "javascript"
  | "python"
  | "typescript"
  | "html"
  | "css"
  | "json"
  | "sql"
  | "bash";

export const LANGUAGES: { id: LanguageId; label: string; prism: string }[] = [
  { id: "javascript", label: "JavaScript", prism: "javascript" },
  { id: "python", label: "Python", prism: "python" },
  { id: "typescript", label: "TypeScript", prism: "tsx" },
  { id: "html", label: "HTML", prism: "markup" },
  { id: "css", label: "CSS", prism: "css" },
  { id: "json", label: "JSON", prism: "json" },
  { id: "sql", label: "SQL", prism: "sql" },
  { id: "bash", label: "Bash", prism: "bash" },
];

export const prismLanguage = (id: LanguageId) =>
  LANGUAGES.find((l) => l.id === id)?.prism ?? "javascript";

export const languageLabel = (id: LanguageId) =>
  LANGUAGES.find((l) => l.id === id)?.label ?? id;

/** Short on purpose: enough shape to watch, small enough to read. */
export const EXAMPLES: Record<LanguageId, string> = {
  javascript: `const motion = {
  speed: 0.8,
  effect: "scramble",
}

export function play(frame) {
  const t = frame * motion.speed
  return Math.sin(t) * 0.5 + 0.5
}`,

  typescript: `type Motion = {
  speed: number
  effect: "scramble" | "typewriter"
}

export const play = (m: Motion, frame: number): number => {
  const t = frame * m.speed
  return Math.min(1, Math.sin(t) * 0.5 + 0.5)
}`,

  python: `motion = {
    "speed": 0.8,
    "effect": "scramble",
}

def play(frame: int) -> float:
    t = frame * motion["speed"]
    return min(1.0, math.sin(t) * 0.5 + 0.5)`,

  html: `<section class="rekt-code">
  <header>
    <h2>Motion</h2>
    <button type="button">Replay</button>
  </header>
  <pre><code>const speed = 0.8</code></pre>
</section>`,

  css: `.rekt-code {
  --accent: #f75001;
  display: grid;
  gap: 12px;
  font-family: ui-monospace, monospace;
}

.rekt-code .keyword {
  color: var(--accent);
}`,

  json: `{
  "name": "rekt-code",
  "speed": 0.8,
  "animation": "scramble",
  "syntax": {
    "accent": "#f75001",
    "lineNumbers": true
  }
}`,

  sql: `select
  effect,
  round(avg(speed), 2) as avg_speed,
  count(*) as frames
from motion_frames
where speed > 0.5
group by effect
order by avg_speed desc
limit 5;`,

  bash: `#!/usr/bin/env bash
set -euo pipefail

for frame in $(seq 1 12); do
  printf "frame %02d\\n" "$frame"
  sleep 0.08
done`,
};
