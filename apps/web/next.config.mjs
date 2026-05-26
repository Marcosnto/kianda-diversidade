/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/db", "@workspace/ui"],
  images: {
    remotePatterns: [new URL("https://ik.imagekit.io/kiandadiversidade/**")],
  },
};

export default nextConfig;
