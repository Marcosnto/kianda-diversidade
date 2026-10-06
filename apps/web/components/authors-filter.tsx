"use client";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import type { PublicAuthorListItem } from "@workspace/db/authors";
import { Search, X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type AuthorsFilterProps = {
	authors: PublicAuthorListItem[];
};

const portugueseCollator = new Intl.Collator("pt-BR", {
	sensitivity: "base",
	numeric: true,
});

function normalizeSearchValue(value: string) {
	return value
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLocaleLowerCase("pt-BR")
		.trim();
}

export function AuthorsFilter({ authors }: AuthorsFilterProps) {
	const [search, setSearch] = useState("");
	const normalizedSearch = normalizeSearchValue(search);
	const sortedAuthors = [...authors].sort((first, second) =>
		portugueseCollator.compare(first.name, second.name),
	);
	const filteredAuthors = normalizedSearch
		? sortedAuthors.filter((author) =>
				[author.name, author.bio ?? ""].some((value) =>
					normalizeSearchValue(value).includes(normalizedSearch),
				),
			)
		: sortedAuthors;

	return (
		<>
			<div className="mx-auto mt-8 w-full max-w-3xl">
				<div className="relative">
					<Search
						aria-hidden="true"
						className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-k-olive-dark/70"
					/>
					<Input
						aria-label="Pesquisar autores"
						className="h-12 rounded-lg border-k-olive-light bg-white pr-12 pl-11 text-base text-k-olive-deep shadow-none placeholder:text-k-olive-dark/60 focus-visible:border-k-olive-dark focus-visible:ring-k-olive-light/30"
						onChange={(event) => setSearch(event.target.value)}
						placeholder="Pesquisar por nome ou apresentação"
						type="search"
						value={search}
					/>
					{search && (
						<Button
							aria-label="Limpar pesquisa"
							className="absolute top-1/2 right-1.5 size-9 -translate-y-1/2 text-k-olive-dark hover:bg-k-olive-light/20"
							onClick={() => setSearch("")}
							size="icon"
							type="button"
							variant="ghost"
						>
							<X />
						</Button>
					)}
				</div>
				{search && (
					<p aria-live="polite" className="mt-3 text-sm text-k-olive-dark">
						{filteredAuthors.length === 1
							? "1 autor encontrado"
							: `${filteredAuthors.length} autores encontrados`}
					</p>
				)}
			</div>

			{filteredAuthors.length > 0 ? (
				<ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
					{filteredAuthors.map((author) => (
						<li key={author.id}>
							<Link
								className="group mx-auto flex h-full w-full max-w-80.25 flex-col overflow-hidden rounded-lg bg-k-olive-light text-white transition-transform hover:-translate-y-1 md:max-w-99"
								href={`/authors/${author.id}`}
							>
								<div className="relative h-73.5 w-full overflow-hidden bg-k-olive-dark sm:h-90.5 md:h-80 lg:h-90.5 xl:h-95 2xl:h-75">
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
			) : search ? (
				<div className="mt-10 border-t border-k-olive-light py-16 text-center">
					<h2 className="text-2xl font-semibold text-k-olive-deep">
						Nenhum autor encontrado
					</h2>
					<p className="mt-3 text-k-olive-dark">
						Tente pesquisar por outro nome ou apresentação.
					</p>
					<Button
						className="mt-5 text-k-olive-dark"
						onClick={() => setSearch("")}
						type="button"
						variant="outline"
					>
						Limpar pesquisa
					</Button>
				</div>
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
		</>
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
