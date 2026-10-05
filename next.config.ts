import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Landing de la asesoría (archivo estático en public/asesoria)
  async rewrites() {
    return [{ source: "/asesoria", destination: "/asesoria/index.html" }];
  },
};

export default nextConfig;
