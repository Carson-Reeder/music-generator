//import type { NextConfig } from "next";

//const nextConfig: NextConfig = {
/* config options here */
//};

//export default nextConfig;

const nextConfig = {
  basePath: "/music-generator",
  output: "export",
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
