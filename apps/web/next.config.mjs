/** @type {import('next').NextConfig} */
const nextConfig = {
	transpilePackages: ["@workspace/db", "@workspace/ui"],
	images: {
		// Reduz o tempo de cache das imagens otimizadas para refletir trocas
		// de foto de autor/capa mais rapidamente (padrão do Next é 60s).
		minimumCacheTTL: 5,
		remotePatterns: [
			new URL("https://ik.imagekit.io/kiandadiversidade/**"),
			new URL("https://s.gravatar.com/avatar/**"),
			new URL("https://lh3.googleusercontent.com/**"),
		],
	},
};

export default nextConfig;
