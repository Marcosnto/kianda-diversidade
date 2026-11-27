import ArticleCard from "@/components/card";
import {
	getPublishedAuthorById,
	getPublishedAuthors,
} from "@workspace/db/authors";
import { cn } from "@workspace/ui/lib/utils";
import {
	AtSign,
	ExternalLink,
	Facebook,
	FileText,
	Globe2,
	GraduationCap,
	Instagram,
	Linkedin,
	MessageCircle,
	Music2,
	Youtube,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

type AuthorPageProps = {
	params: Promise<{ id: string }>;
};

const portugueseCollator = new Intl.Collator("pt-BR", {
	sensitivity: "base",
	numeric: true,
});

export const revalidate = 5;
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
		{ label: "Facebook", url: author.facebook, icon: Facebook },
		{ label: "Threads", url: author.threads, icon: MessageCircle },
		{ label: "Lattes", url: author.lattes, icon: FileText },
		{ label: "Academia.edu", url: author.academia, icon: GraduationCap },
	].filter((link): link is typeof link & { url: string } => Boolean(link.url));

	const sortedArticles = [...author.articles].sort((first, second) =>
		portugueseCollator.compare(first.title, second.title),
	);

	return (
		<main className="mx-auto w-full px-4 pt-28 pb-16 sm:px-6 sm:pt-32 lg:px-8 xl:px-12 2xl:px-32">
			<section className="flex flex-col items-start gap-7 border-b border-k-olive-light pb-10 lg:flex-row lg:gap-8">
				<div className="relative mx-auto aspect-square w-full max-w-[280px] overflow-hidden rounded-2xl bg-k-olive-dark text-white sm:max-w-[320px] lg:mx-0 lg:aspect-auto lg:h-[362px] lg:w-[30%] lg:max-w-none lg:flex-shrink-0 lg:rounded-lg xl:h-[380px] 2xl:h-[300px] 2xl:w-[calc((100%-3*2rem)/4)]">
					{author.picture ? (
						<Image
							alt={author.name}
							className="object-cover"
							fill
							priority
							sizes="(max-width: 640px) 280px, (max-width: 1024px) 320px, 30vw"
							src={author.picture}
						/>
					) : (
						<div className="flex h-full items-center justify-center text-6xl font-semibold">
							{getInitials(author.name)}
						</div>
					)}
				</div>

				<div className="w-full min-w-0 lg:flex-1">
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
						<div className="mt-8">
							<p className="text-xs font-semibold uppercase tracking-wide text-k-olive-dark/70">
								Redes e links
							</p>
							<ul className="mt-3 grid max-w-xl grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
								{socialLinks.map(({ label, url, icon: Icon }) => (
									<li key={label} className="min-w-0">
										<a
											className="group inline-flex h-11 w-full items-center gap-2.5 rounded-lg border border-k-olive-light/30 bg-k-off-white/60 px-3 text-sm font-medium text-k-olive-dark shadow-sm transition-all hover:border-k-olive-dark hover:bg-k-olive-dark hover:text-white hover:shadow-md focus-visible:ring-2 focus-visible:ring-k-olive-dark/30 focus-visible:outline-none"
											href={url}
											rel="noreferrer"
											target="_blank"
										>
											<Icon className="size-4 shrink-0" />
											<span className="truncate">{label}</span>
											<ExternalLink className="ml-auto size-3.5 shrink-0 opacity-40 transition-opacity group-hover:opacity-100" />
										</a>
									</li>
								))}
							</ul>
						</div>
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
				<ul
					className={cn(
						"mt-8 grid grid-cols-1 gap-6 sm:gap-8",
						"md:grid-cols-1",
						"lg:grid-cols-2 lg:gap-8",
						"xl:grid-cols-2 xl:gap-8",
						"2xl:grid-cols-4 2xl:gap-8",
					)}
				>
					{sortedArticles.map((article) => (
						<li className="w-full" key={article.id}>
							<ArticleCard
								author={author.name}
								authorId={author.id}
								coverImage={article.cover_image?.url}
								date={article.published_in}
								id={article.id}
								tags={article.tags}
								title={article.title}
								linkClassName="w-full"
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
