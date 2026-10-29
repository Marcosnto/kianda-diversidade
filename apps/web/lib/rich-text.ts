function escapeHtml(value: string) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;");
}

function escapeAttribute(value: string) {
	return escapeHtml(value).replaceAll('"', "&quot;");
}

function decodeBasicHtmlEntities(value: string) {
	return value
		.replaceAll("&lt;", "<")
		.replaceAll("&gt;", ">")
		.replaceAll("&quot;", '"')
		.replaceAll("&#34;", '"')
		.replaceAll("&#x27;", "'")
		.replaceAll("&#39;", "'")
		.replaceAll("&amp;", "&");
}

function getHtmlAttribute(tag: string, attribute: string) {
	return tag.match(
		new RegExp(`${attribute}\\s*=\\s*["']([^"']+)["']`, "i"),
	)?.[1];
}

function renderInlineMarkdown(value: string) {
	const images: string[] = [];
	const withHtmlImages = value.replace(/<img\b[^>]*\/?\s*>/gi, (tag) => {
		const src = getHtmlAttribute(tag, "src");
		if (!src || !/^https?:\/\//.test(decodeBasicHtmlEntities(src))) return "";

		const marker = `@@KIANDA-IMAGE-${images.length}@@`;
		const alt = getHtmlAttribute(tag, "alt") ?? "";
		images.push(
			`<img src="${escapeAttribute(decodeBasicHtmlEntities(src))}" alt="${escapeAttribute(decodeBasicHtmlEntities(alt))}" loading="lazy" />`,
		);
		return marker;
	});

	let html = escapeHtml(withHtmlImages).replace(
		/!\[([^\]]*)\]\((https?:\/\/[^\s)]+)(?:\s+"[^"]*")?\)/g,
		(_, alt: string, src: string) => {
			const marker = `@@KIANDA-IMAGE-${images.length}@@`;
			images.push(
				`<img src="${escapeAttribute(decodeBasicHtmlEntities(src))}" alt="${escapeAttribute(alt)}" loading="lazy" />`,
			);
			return marker;
		},
	);

	html = html
		.replace(
			/&lt;(\/?)(strong|b|em|i|u|s|del)&gt;/gi,
			(_, closing: string, tag: string) => {
				const normalizedTag =
					tag.toLowerCase() === "b"
						? "strong"
						: tag.toLowerCase() === "i"
							? "em"
							: tag.toLowerCase();
				return `<${closing}${normalizedTag}>`;
			},
		)
		.replace(/&lt;br\s*\/?&gt;/gi, "<br />")
		.replace(
			/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
			(_, label: string, href: string) =>
				`<a href="${escapeAttribute(decodeBasicHtmlEntities(href))}" rel="noreferrer" target="_blank">${label}</a>`,
		)
		.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
		.replace(/__([^_\n]+)__/g, "<strong>$1</strong>")
		.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "<em>$1</em>")
		.replace(/(?<!_)_([^_\n]+)_(?!_)/g, "<em>$1</em>");

	return html.replace(/@@KIANDA-IMAGE-(\d+)@@/g, (_, index: string) => {
		return images[Number(index)] ?? "";
	});
}

function renderParagraph(value: string) {
	return `<p>${renderInlineMarkdown(value).replace(/\n/g, "<br />")}</p>`;
}

function renderBlockquote(value: string) {
	const quote = value
		.split("\n")
		.map((line) => line.replace(/^>\s?/, ""))
		.join("\n")
		.trim();

	const paragraphs = quote
		.split(/\n\s*\n/)
		.filter(Boolean)
		.map(renderParagraph)
		.join("");

	return `<blockquote>${paragraphs}</blockquote>`;
}

function renderList(value: string, ordered: boolean) {
	const tag = ordered ? "ol" : "ul";
	const pattern = ordered ? /^\d+\.\s+/ : /^[-*+]\s+/;
	const items = value
		.split("\n")
		.map((line) => line.replace(pattern, ""))
		.map((item) => `<li>${renderInlineMarkdown(item)}</li>`)
		.join("");

	return `<${tag}>${items}</${tag}>`;
}

function getVideoEmbed(urlValue: string) {
	try {
		const markdownUrl = urlValue.match(/^\[[^\]]*]\((https?:\/\/[^)\s]+)\)$/);
		const url = new URL(markdownUrl?.[1] ?? urlValue);
		const hostname = url.hostname.toLowerCase().replace(/^www\./, "");

		if (
			hostname === "youtube.com" ||
			hostname === "m.youtube.com" ||
			hostname === "youtu.be"
		) {
			const pathSegments = url.pathname.split("/").filter(Boolean);
			const id =
				hostname === "youtu.be"
					? pathSegments[0]
					: (url.searchParams.get("v") ??
						(pathSegments[0] === "embed" || pathSegments[0] === "shorts"
							? pathSegments[1]
							: undefined));

			if (id && /^[A-Za-z0-9_-]{11}$/.test(id)) {
				return {
					src: `https://www.youtube-nocookie.com/embed/${id}`,
					title: "Vídeo do YouTube",
				};
			}
		}

		if (hostname === "vimeo.com" || hostname === "player.vimeo.com") {
			const id = url.pathname
				.split("/")
				.filter(Boolean)
				.find((part) => /^\d+$/.test(part));

			if (id) {
				return {
					src: `https://player.vimeo.com/video/${id}`,
					title: "Vídeo do Vimeo",
				};
			}
		}
	} catch {
		return null;
	}

	return null;
}

function renderVideoEmbed(url: string) {
	const video = getVideoEmbed(decodeBasicHtmlEntities(url));
	if (!video) return "";

	return `<figure class="media my-6"><div class="aspect-video w-full"><iframe src="${video.src}" title="${video.title}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen class="h-full w-full rounded-lg"></iframe></div></figure>`;
}

function renderHtmlHeading(value: string) {
	const heading = value.match(/^<h([1-6])\b[^>]*>([\s\S]+)<\/h\1>$/i);
	if (!heading?.[1] || !heading[2]) return null;

	return `<h${heading[1]}>${renderInlineMarkdown(heading[2])}</h${heading[1]}>`;
}

function renderHtmlBlockquote(value: string) {
	const quote = value.match(/^<blockquote\b[^>]*>([\s\S]+)<\/blockquote>$/i);
	if (!quote?.[1]) return null;

	const paragraphs = quote[1]
		.replace(/<\/?p\b[^>]*>/gi, "\n\n")
		.trim()
		.split(/\n\s*\n/)
		.filter(Boolean)
		.map(renderParagraph)
		.join("");

	return `<blockquote>${paragraphs}</blockquote>`;
}

function renderBlock(block: string) {
	const value = block.trim();
	if (!value) return "";

	const htmlHeading = renderHtmlHeading(value);
	if (htmlHeading) return htmlHeading;

	const htmlQuote = renderHtmlBlockquote(value);
	if (htmlQuote) return htmlQuote;

	const heading = value.match(/^(#{1,6})\s+(.+)$/);
	if (heading?.[1] && heading[2]) {
		const level = heading[1].length;
		return `<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`;
	}

	if (value.split("\n").every((line) => /^>\s?/.test(line))) {
		return renderBlockquote(value);
	}

	if (value.split("\n").every((line) => /^[-*+]\s+/.test(line))) {
		return renderList(value, false);
	}

	if (value.split("\n").every((line) => /^\d+\.\s+/.test(line))) {
		return renderList(value, true);
	}

	if (/^(---|\*\*\*|___)$/.test(value)) return "<hr />";
	return renderParagraph(value);
}

export function processRichTextContent(content: string): string {
	const videoEmbeds: string[] = [];
	const richTextBlocks: string[] = [];
	const addRichTextBlock = (html: string | null) => {
		if (!html) return "";

		const marker = `__KIANDA_RICH_TEXT_BLOCK_${richTextBlocks.length}__`;
		richTextBlocks.push(html);
		return `\n\n${marker}\n\n`;
	};
	const addVideoEmbed = (url: string) => {
		const embed = renderVideoEmbed(url);
		if (!embed) return "";

		const marker = `__KIANDA_VIDEO_EMBED_${videoEmbeds.length}__`;
		videoEmbeds.push(embed);
		return `\n\n${marker}\n\n`;
	};

	// MDXEditor can export HTML blocks with empty lines between their child nodes.
	// Preserve them before splitting Markdown into blocks; otherwise a blockquote
	// would be broken into separate escaped paragraphs.
	// Some editor versions escape block markers when serializing Markdown. They
	// are formatting controls here (not literal text), so restore them before
	// detecting headings and quotes.
	// Content saved from Windows (or serialized with CRLF) must be normalized
	// first: a trailing "\r" makes block detection fail, so headings and quotes
	// would be rendered as literal "#" and ">" characters.
	const normalizedContent = content
		.replace(/\r\n?/g, "\n")
		.replace(/^\\(#{1,6})\s+/gm, "$1 ")
		.replace(/^\\>\s?/gm, "> ");

	const withProtectedRichTextBlocks = normalizedContent
		.replace(/<h([1-6])\b[^>]*>[\s\S]*?<\/h\1>/gi, (block: string) =>
			addRichTextBlock(renderHtmlHeading(block)),
		)
		.replace(/<blockquote\b[^>]*>[\s\S]*?<\/blockquote>/gi, (block: string) =>
			addRichTextBlock(renderHtmlBlockquote(block)),
		);

	const withEmbeds = withProtectedRichTextBlocks
		.replace(
			/::video\{url=(?:"([^"]+)"|'([^']+)')\}/g,
			(
				_,
				doubleQuotedUrl: string | undefined,
				singleQuotedUrl: string | undefined,
			) => addVideoEmbed(doubleQuotedUrl ?? singleQuotedUrl ?? ""),
		)
		.replace(
			/<figure class=["']media["']>\s*<oembed url=["']([^"']+)["']><\/oembed>\s*<\/figure>/gi,
			(_, url: string) => addVideoEmbed(url),
		)
		.replace(
			/<figure\b[^>]*>\s*<div\b[^>]*>\s*<iframe\b[^>]*\bsrc=["']([^"']+)["'][\s\S]*?<\/iframe>\s*<\/div>\s*<\/figure>/gi,
			(_, url: string) => addVideoEmbed(url),
		);

	return withEmbeds
		.split(/\n{2,}/)
		.map((block) => {
			const trimmed = block.trim();
			return /^(?:__KIANDA_VIDEO_EMBED_|__KIANDA_RICH_TEXT_BLOCK_)\d+__$/.test(
				trimmed,
			)
				? trimmed
				: renderBlock(block);
		})
		.join("")
		.replace(/__KIANDA_RICH_TEXT_BLOCK_(\d+)__/g, (_, index: string) => {
			return richTextBlocks[Number(index)] ?? "";
		})
		.replace(/__KIANDA_VIDEO_EMBED_(\d+)__/g, (_, index: string) => {
			return videoEmbeds[Number(index)] ?? "";
		});
}
