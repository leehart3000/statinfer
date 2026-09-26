import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the Next.js indicator that appears in the corner during `pnpm dev`.
  devIndicators: false,
  // Allow pages to be written in MDX as well as TypeScript.
  pageExtensions: ["ts", "tsx", "md", "mdx"],
};

const withMDX = createMDX({});

export default withMDX(nextConfig);