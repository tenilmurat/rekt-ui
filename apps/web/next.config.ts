import type { NextConfig } from "next";

/**
 * Rekt UI runs at the root of its own domain. To mount it under a path instead
 * (e.g. "/components"), set NEXT_PUBLIC_BASE_PATH at build time: Next prefixes
 * routes and /_next assets itself, and files in public/ go through `asset()` in
 * lib/base-path.ts, which reads the same value.
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "standalone",
  basePath: BASE_PATH,
  env: { NEXT_PUBLIC_BASE_PATH: BASE_PATH },
};

export default nextConfig;
