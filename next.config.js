const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.resolve.alias["@db"] = path.resolve(__dirname, "../../packages/db/index");
    return config;
  },
};

module.exports = nextConfig;
