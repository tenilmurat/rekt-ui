// @ts-check
import { createInterface } from "node:readline/promises";

/** Terminal output: colours (off when piped or NO_COLOR is set), a spinner, one yes/no prompt. */

const useColor = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;

/** @param {number} open @param {number} close */
const paint = (open, close) => (/** @type {unknown} */ text) =>
  useColor ? `\x1b[${open}m${text}\x1b[${close}m` : String(text);

export const c = {
  bold: paint(1, 22),
  dim: paint(2, 22),
  red: paint(31, 39),
  green: paint(32, 39),
  yellow: paint(33, 39),
  cyan: paint(36, 39),
  gray: paint(90, 39),
};

export const mark = {
  ok: c.green("✓"),
  skip: c.yellow("–"),
  fail: c.red("✕"),
  info: c.cyan("›"),
};

/** A user-facing failure: printed without a stack trace, exits with code 1. */
export class CliError extends Error {}

const FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

/**
 * A one-line spinner. Without a TTY (CI, pipes) it prints nothing until it
 * finishes, so logs stay clean.
 * @param {string} text
 */
export function spinner(text) {
  const live = Boolean(process.stdout.isTTY);
  let frame = 0;
  const timer = live
    ? setInterval(() => {
        process.stdout.write(`\r${c.cyan(FRAMES[frame++ % FRAMES.length])} ${text}`);
      }, 80)
    : null;
  /** @param {string} symbol @param {string} message */
  const end = (symbol, message) => {
    if (timer) clearInterval(timer);
    if (live) process.stdout.write("\r\x1b[2K");
    console.log(`${symbol} ${message}`);
  };
  return {
    /** @param {string} [message] */
    succeed: (message = text) => end(mark.ok, message),
    /** @param {string} [message] */
    fail: (message = text) => end(mark.fail, message),
    stop() {
      if (timer) clearInterval(timer);
      if (live) process.stdout.write("\r\x1b[2K");
    },
  };
}

/**
 * Asks a yes/no question. Without a TTY it answers with the default, so
 * scripts never hang.
 * @param {string} question
 * @param {boolean} [fallback]
 */
export async function confirm(question, fallback = false) {
  if (!process.stdin.isTTY) return fallback;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = (await rl.question(`${c.cyan("?")} ${question} ${c.dim(fallback ? "(Y/n)" : "(y/N)")} `)).trim().toLowerCase();
  rl.close();
  return answer ? answer === "y" || answer === "yes" : fallback;
}
