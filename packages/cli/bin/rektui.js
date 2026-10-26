#!/usr/bin/env node
// @ts-check
import { main } from "../src/cli.js";
import { CliError, c } from "../src/ui.js";

main(process.argv.slice(2)).catch((error) => {
  if (error instanceof CliError || error?.code?.startsWith?.("ERR_PARSE_ARGS")) {
    console.error(`\n${c.red("✕")} ${error.message}`);
  } else {
    console.error(error);
  }
  process.exitCode = 1;
});
