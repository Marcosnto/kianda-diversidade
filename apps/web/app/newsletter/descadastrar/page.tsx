import { unsubscribeFromNewsletter } from "@workspace/db/newsletter";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Cancelar inscrição | Kianda Diversidade",
	description: "Cancele sua inscrição na newsletter da Kianda Diversidade.",
};

export const dynamic = "force-dynamic";

type Props = {
	searchParams: Promise<{ token?: string }>;
};

export default async function UnsubscribeNewsletterPage({
	searchParams,
}: Props) {
	const { token } = await searchParams;
	const removed = token ? await unsubscribeFromNewsletter(token) : false;

	return (
		<main className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center px-4 py-24 text-center">
			<h1 className="text-3xl font-semibold text-k-olive-deep sm:text-4xl">
				{removed ? "Inscrição cancelada" : "Link inválido ou expirado"}
			</h1>
			<p className="mt-4 text-base leading-7 text-k-olive-dark sm:text-lg">
				{removed
					? "Pronto! Você não receberá mais os e-mails da newsletter da Kianda Diversidade."
					: "Não encontramos uma inscrição ativa para este link. Ela pode já ter sido cancelada."}
			</p>
			<Link
				className="mt-8 inline-flex h-11 items-center rounded-lg bg-k-olive-dark px-6 text-sm font-medium text-k-yellow-light transition-opacity hover:opacity-90"
				href="/"
			>
				Voltar para o início
			</Link>
		</main>
	);
}
