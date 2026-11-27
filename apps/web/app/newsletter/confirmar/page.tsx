import { confirmNewsletterSubscription } from "@workspace/db/newsletter";
import type { Metadata } from "next";
import Link from "next/link";
import { sendWelcomeEmail } from "@/lib/email";

export const metadata: Metadata = {
	title: "Confirmação de inscrição | Kianda Diversidade",
	description: "Confirme sua inscrição para receber as novidades da Kianda.",
};

export const dynamic = "force-dynamic";

type Props = {
	searchParams: Promise<{ token?: string }>;
};

export default async function ConfirmNewsletterPage({ searchParams }: Props) {
	const { token } = await searchParams;
	const subscriber = token
		? await confirmNewsletterSubscription(token)
		: null;

	if (subscriber) {
		await sendWelcomeEmail({
			to: subscriber.email,
			unsubscribeToken: subscriber.unsubscribeToken,
		});
	}

	const confirmed = Boolean(subscriber);

	return (
		<main className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center px-4 py-24 text-center">
			<h1 className="text-3xl font-semibold text-k-olive-deep sm:text-4xl">
				{confirmed ? "Inscrição confirmada!" : "Link inválido ou expirado"}
			</h1>
			<p className="mt-4 text-base leading-7 text-k-olive-dark sm:text-lg">
				{confirmed
					? "Tudo certo! Você passará a receber as novidades da Kianda Diversidade por e-mail."
					: "Não encontramos uma inscrição pendente para este link. Você pode se inscrever novamente pelo formulário no rodapé do site."}
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
