/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  images: {
    remotePatterns: [new URL("https://api.slingacademy.com/**")],
  },
};

export default nextConfig;
