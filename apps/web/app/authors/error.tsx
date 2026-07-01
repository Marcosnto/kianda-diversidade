"use client";

import { Button } from "@workspace/ui/components/button";

export default function AuthorsError({ reset }: { reset: () => void }) {
	return (
		<main className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-4 pt-28 text-center">
			<h1 className="text-3xl font-semibold text-k-olive-deep">
				Não foi possível carregar os autores
			</h1>
			<p className="mt-3 text-k-olive-dark">Tente novamente em instantes.</p>
			<Button
				className="mt-6 bg-k-olive-dark text-k-yellow-light hover:bg-k-olive-deep"
				onClick={reset}
				type="button"
			>
				Tentar novamente
			</Button>
		</main>
	);
}
