import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

// Use require for next-pwa to avoid TS typing issues with the old next-pwa package
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

export default withPWA(nextConfig);
