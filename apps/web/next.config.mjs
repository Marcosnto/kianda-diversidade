/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/db", "@workspace/ui"],
  images: {
    remotePatterns: [
      new URL("https://ik.imagekit.io/kiandadiversidade/**"),
      new URL("https://s.gravatar.com/avatar/**"),
      new URL("https://lh3.googleusercontent.com/**"),
    ],
  },
};

export default nextConfig;
