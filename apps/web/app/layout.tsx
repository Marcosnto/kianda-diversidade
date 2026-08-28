import type { Metadata } from "next";

// @ts-expect-error CSS side-effect imports are resolved by Next.js at build time.
import "@workspace/ui/globals.css";
// @ts-expect-error CSS side-effect imports are resolved by Next.js at build time.
import "./fonts.css";

import Footer from "@/components/footer";
import HeaderMenu from "@/components/header-menu";

export const metadata: Metadata = {
	title: {
		default: "Kianda Diversidade",
		template: "%s | Kianda Diversidade",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="pt-BR">
			<body className="font-sans antialiased bg-k-yellow-light">
				<HeaderMenu />
				{children}
				<Footer />
			</body>
		</html>
	);
}
