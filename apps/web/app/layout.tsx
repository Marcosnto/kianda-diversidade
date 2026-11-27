import type { Metadata } from "next";

import "@workspace/ui/globals.css";
import "./fonts.css";

import Footer from "@/components/footer";
import { GoogleAnalytics } from "@/components/google-analytics";
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
				<GoogleAnalytics />
				<HeaderMenu />
				{children}
				<Footer />
			</body>
		</html>
	);
}
