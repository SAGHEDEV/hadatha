import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cryptologos.cc",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
      {
        protocol: "https",
        hostname: "aggregator.walrus-testnet.walrus.space",
      },
      {
        protocol: "https",
        hostname: "walrus-testnet-aggregator.redundex.com",
      },
      {
        protocol: "https",
        hostname: "github.com",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
    ],
  }
};

export default nextConfig;
