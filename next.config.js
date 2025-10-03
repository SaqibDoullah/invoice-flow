/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // This is required to make pdfkit work with Next.js.
    // It ensures that the font assets are correctly bundled.
    config.module.rules.push({
      test: /\.afm$/,
      type: 'asset/source',
    });

    return config;
  },
};

module.exports = nextConfig;
