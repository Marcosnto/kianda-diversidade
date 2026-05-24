import type { Metadata } from "next";
import "@workspace/ui/globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Kianda Diversidade",
  description:
    "Painel administrativo para gestão de diversidade e inclusão na Kianda",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
