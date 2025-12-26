/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  images: {
    remotePatterns: [new URL("http://cms.kiandadiversidade.com/**")],
  },
};

export default nextConfig;
