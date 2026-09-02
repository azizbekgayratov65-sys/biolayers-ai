import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@napi-rs/canvas",
    "pdf-parse",
    "pdfjs-dist",
    "mammoth",
  ],
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@xyflow/react",
      "react-dom",
    ],
  },
};

export default nextConfig;
