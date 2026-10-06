import { getPublishedAuthors } from "@workspace/db/authors";
import { AuthorsFilter } from "@/components/authors-filter";

export const revalidate = 15;

export const metadata = {
	title: "Autores",
	description: "Conheça quem escreve os conteúdos da Kianda Diversidade.",
};

export default async function AuthorsPage() {
	const authors = await getPublishedAuthors();

	return (
		<main className="mx-auto w-full max-w-7xl px-4 pt-28 pb-16 sm:px-6 sm:pt-32 lg:px-8 xl:px-12">
			<header className="max-w-3xl">
				<h1 className="text-3xl font-semibold text-k-olive-deep sm:text-4xl">
					Autores
				</h1>
				<p className="mt-3 text-base leading-7 text-k-olive-dark sm:text-lg">
					Conheça as pessoas que compartilham reflexões e conteúdos na Kianda
					Diversidade.
				</p>
			</header>

			<AuthorsFilter authors={authors} />
		</main>
	);
}
