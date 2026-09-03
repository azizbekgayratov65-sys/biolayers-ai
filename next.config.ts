import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@napi-rs/canvas",
    "pdf-parse",
    "pdfjs-dist",
    "mammoth",
  ],
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
  },
  compress: true,
  async redirects() {
    return [
      {
        source: "/platform",
        destination: "/",
        permanent: true,
      },
      {
        source: "/rosetta",
        destination: "/cipher",
        permanent: true,
      },
      {
        source: "/cause-effect",
        destination: "/cipher",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|png|webp|avif|ico|woff2|woff)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
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
