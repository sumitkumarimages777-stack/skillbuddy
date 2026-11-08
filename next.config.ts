import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : undefined;

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: supabaseHost ? { remotePatterns: [{ protocol: "https", hostname: supabaseHost }] } : undefined,
  experimental: {
    // Allows mentor / project image uploads through server actions.
    serverActions: { bodySizeLimit: "5mb" },
  },
};

export default nextConfig;
