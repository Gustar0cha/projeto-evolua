import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpila a lib ReactBits para evitar problemas de ESM/TS em Next
  transpilePackages: ["@appletosolutions/reactbits"],
};

export default nextConfig;
