import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ip-radar/economics", "@ip-radar/demo-data"],
};

export default nextConfig;
