/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  experimental: {
    outputFileTracingIncludes: {
      "/**": ["./happy_journey.db", "./happy_journey.db-wal", "./happy_journey.db-shm"],
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
