import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Nodemailer relies on Node.js built-ins — keep it external
  serverExternalPackages: ["nodemailer"],
};

export default nextConfig;
