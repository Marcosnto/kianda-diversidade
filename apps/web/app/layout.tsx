import type { Metadata } from "next";

import "@workspace/ui/globals.css";
import "./fonts.css";
import { Providers } from "@/components/providers";

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
		<html lang="pt-BR" suppressHydrationWarning>
			<body className="font-sans antialiased bg-k-yellow-light">
				<Providers>
					<HeaderMenu />
					{children}
					<Footer />
				</Providers>
			</body>
		</html>
	);
}
