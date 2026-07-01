import ArticleCard from "@/components/card";
import {
	getPublishedAuthorById,
	getPublishedAuthors,
} from "@workspace/db/authors";
import {
	AtSign,
	ExternalLink,
	Globe2,
	Instagram,
	Linkedin,
	Music2,
	Youtube,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

type AuthorPageProps = {
	params: Promise<{ id: string }>;
};

export const revalidate = 15;
export const dynamicParams = true;

export async function generateStaticParams() {
	const authors = await getPublishedAuthors();
	return authors.map((author) => ({ id: author.id }));
}

export async function generateMetadata({
	params,
}: AuthorPageProps): Promise<Metadata> {
	const { id } = await params;
	const author = await getPublishedAuthorById(id);

	return {
		title: author?.name ?? "Autor não encontrado",
		description:
			author?.bio ?? "Conheça os artigos deste autor na Kianda Diversidade.",
	};
}

export default async function AuthorPage({ params }: AuthorPageProps) {
	const { id } = await params;
	const author = await getPublishedAuthorById(id);

	if (!author) notFound();

	const socialLinks = [
		{ label: "Site", url: author.website, icon: Globe2 },
		{ label: "Instagram", url: author.instagram, icon: Instagram },
		{ label: "LinkedIn", url: author.linkedin, icon: Linkedin },
		{ label: "YouTube", url: author.youtube, icon: Youtube },
		{ label: "TikTok", url: author.tiktok, icon: Music2 },
		{ label: "X", url: author.x, icon: AtSign },
	].filter((link): link is typeof link & { url: string } => Boolean(link.url));

	return (
		<main className="mx-auto w-full max-w-7xl px-4 pt-28 pb-16 sm:px-6 sm:pt-32 lg:px-8 xl:px-12">
			<section className="grid items-start gap-7 border-b border-k-olive-light pb-10 md:grid-cols-[240px_1fr] lg:grid-cols-[300px_1fr] lg:gap-12">
				<div className="relative aspect-square w-full max-w-[300px] overflow-hidden rounded-lg bg-k-olive-dark text-white">
					{author.picture ? (
						<Image
							alt={author.name}
							className="object-cover"
							fill
							priority
							sizes="(max-width: 768px) 80vw, 300px"
							src={author.picture}
						/>
					) : (
						<div className="flex h-full items-center justify-center text-6xl font-semibold">
							{getInitials(author.name)}
						</div>
					)}
				</div>

				<div className="min-w-0">
					<p className="text-sm font-semibold uppercase text-k-cinnamon">
						Autor
					</p>
					<h1 className="mt-1 break-words text-3xl font-semibold text-k-olive-deep sm:text-4xl lg:text-5xl">
						{author.name}
					</h1>
					<p className="mt-5 whitespace-pre-line text-base leading-8 text-k-olive-dark sm:text-lg">
						{author.bio ?? "Este autor ainda não adicionou uma apresentação."}
					</p>

					{socialLinks.length > 0 && (
						<ul className="mt-6 flex flex-wrap gap-2">
							{socialLinks.map(({ label, url, icon: Icon }) => (
								<li key={label}>
									<a
										className="inline-flex h-10 items-center gap-2 rounded-md border border-k-olive-light px-3 text-sm font-medium text-k-olive-dark transition-colors hover:bg-k-olive-light hover:text-white"
										href={url}
										rel="noreferrer"
										target="_blank"
									>
										<Icon className="size-4" />
										{label}
										<ExternalLink className="size-3.5" />
									</a>
								</li>
							))}
						</ul>
					)}
				</div>
			</section>

			<section className="pt-10">
				<div className="flex flex-wrap items-end justify-between gap-3">
					<h2 className="text-2xl font-semibold text-k-olive-deep sm:text-3xl">
						Artigos publicados
					</h2>
					<p className="text-sm text-k-olive-dark">
						{author._count.articles} no total
					</p>
				</div>
				<ul className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
					{author.articles.map((article) => (
						<li className="min-w-0" key={article.id}>
							<ArticleCard
								author={author.name}
								authorId={author.id}
								coverImage={article.cover_image?.url}
								date={article.published_in}
								id={article.id}
								tags={article.tags}
								title={article.title}
							/>
						</li>
					))}
				</ul>
			</section>
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
