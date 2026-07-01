import { getPublishedAuthors } from "@workspace/db/authors";
import Image from "next/image";
import Link from "next/link";

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

			{authors.length > 0 ? (
				<ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
					{authors.map((author) => (
						<li key={author.id}>
							<Link
								className="group flex h-full flex-col overflow-hidden rounded-lg bg-k-olive-light text-white transition-transform hover:-translate-y-1"
								href={`/authors/${author.id}`}
							>
								<div className="relative aspect-[4/3] w-full overflow-hidden bg-k-olive-dark">
									{author.picture ? (
										<Image
											alt={author.name}
											className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
											fill
											sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
											src={author.picture}
										/>
									) : (
										<div className="flex h-full items-center justify-center text-5xl font-semibold">
											{getInitials(author.name)}
										</div>
									)}
								</div>
								<div className="flex flex-1 flex-col p-5">
									<h2 className="text-xl font-semibold">{author.name}</h2>
									<p className="mt-2 line-clamp-3 text-sm leading-6 text-white/85">
										{author.bio ??
											"Conheça os conteúdos publicados por este autor."}
									</p>
									<p className="mt-auto pt-5 text-sm font-medium text-k-yellow-light">
										{author._count.articles === 1
											? "1 artigo publicado"
											: `${author._count.articles} artigos publicados`}
									</p>
								</div>
							</Link>
						</li>
					))}
				</ul>
			) : (
				<div className="mt-12 border-t border-k-olive-light py-16 text-center">
					<h2 className="text-2xl font-semibold text-k-olive-deep">
						Nenhum autor publicado ainda
					</h2>
					<p className="mt-3 text-k-olive-dark">
						Os perfis aparecerão aqui quando seus primeiros artigos forem
						publicados.
					</p>
				</div>
			)}
		</main>
	);
}

function getInitials(name: string) {
	return name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join("");
}
