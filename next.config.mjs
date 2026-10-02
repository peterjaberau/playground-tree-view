/** @type {import('next').NextConfig} */

import { dirname } from "node:path"
import { fileURLToPath } from "node:url"

const projectRoot = dirname(fileURLToPath(import.meta.url))

const nextConfig = {
  /* config options here */
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  cacheComponents: true,
  turbopack: {
    root: projectRoot,
  },
  experimental: {
    inlineCss: true,
    optimizePackageImports: ["@chakra-ui/react"],
    externalDir: true,
  },
}

export default nextConfig
