import type { NextConfig } from "next";

/**
 * GitHub Pages serves plain files from a subdirectory
 * (https://<user>.github.io/<repo>/), so the app is built as a static export
 * with a base path. `NEXT_PUBLIC_BASE_PATH` is empty for local dev and set by
 * the deploy workflow to `/<repo-name>`.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  // Cache Components / PPR cannot be enabled in export mode.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
