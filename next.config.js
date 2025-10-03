/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdfkit"], // Keep pdfkit external
  },
  webpack: (config) => {
    // Ensure .afm files are treated as assets so they get copied
    config.module.rules.push({
      test: /\.afm$/i,
      type: "asset/source",
    });
    return config;
  },
};

module.exports = nextConfig;
