// @ts-check
import { parseArgs } from "node:util";
import { add } from "./add.js";
import { list } from "./list.js";
import { registryUrl } from "./registry.js";
import { CliError, c } from "./ui.js";
import { VERSION } from "./version.js";

const HELP = `
${c.bold("rektui")} ${c.dim(VERSION)} — add Rekt UI components to your project

${c.bold("Usage")}
  npx rektui add <component…>   copy components into components/rekt-ui/
  npx rektui list               see every component

${c.bold("Options for add")}
  --dir <path>      put the files somewhere else
  --overwrite       replace files you already have
  -y, --yes         don't ask; keep files that differ
  --dry-run         show what would change, write nothing
  --no-install      don't install npm dependencies

${c.bold("Everywhere")}
  --registry <url>  use another registry (or set REKTUI_REGISTRY)
  -v, --version     print the version
  -h, --help        print this help

${c.dim("Pro components: set REKTUI_TOKEN to your Rekt UI key.")}
`;

/** @param {string[]} argv */
export async function main(argv) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      dir: { type: "string" },
      overwrite: { type: "boolean", default: false },
      yes: { type: "boolean", short: "y", default: false },
      "dry-run": { type: "boolean", default: false },
      "no-install": { type: "boolean", default: false },
      registry: { type: "string" },
      version: { type: "boolean", short: "v", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  });

  if (values.version) return console.log(VERSION);
  const [command, ...rest] = positionals;
  if (values.help || !command) return console.log(HELP);

  console.log(`\n${c.bold("Rekt UI")} ${c.dim(`v${VERSION}`)}\n`);

  if (command === "add") {
    return add(rest, {
      registry: registryUrl(values.registry),
      dir: values.dir,
      overwrite: Boolean(values.overwrite),
      yes: Boolean(values.yes),
      dryRun: Boolean(values["dry-run"]),
      install: !values["no-install"],
    });
  }
  if (command === "list" || command === "ls") return list({ registry: registryUrl(values.registry) });

  throw new CliError(`Unknown command "${command}". Run \`npx rektui --help\`.`);
}
