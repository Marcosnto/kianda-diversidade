import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CreateLink,
  type DirectiveDescriptor,
  diffSourcePlugin,
  directivesPlugin,
  headingsPlugin,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  imagePlugin,
  insertDirective$,
  ListsToggle,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  MDXEditor,
  type MDXEditorMethods,
  type MDXEditorProps,
  markdownShortcutPlugin,
  NestedLexicalEditor,
  quotePlugin,
  rootEditor$,
  Separator,
  type Translation,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
  useCellValue,
  usePublisher,
} from "@mdxeditor/editor";
import { $getSelection, $isRangeSelection, type LexicalNode } from "lexical";
import { AlignCenter, AlignLeft, AlignRight, Video } from "lucide-react";
import {
  type ForwardedRef,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import "@mdxeditor/editor/style.css";
import "./mdx-editor.css";

type Alignment = "left" | "center" | "right";

type ContentImageUploadResponse = {
  url?: string;
  error?: string;
};

type InitializedMDXEditorProps = {
  editorRef?: ForwardedRef<MDXEditorMethods> | null;
  onImageUploadChange?: (isUploading: boolean) => void;
} & MDXEditorProps;

const editorTranslations: Record<string, string> = {
  "uploadImage.dialogTitle": "Enviar imagem",
  "uploadImage.uploadInstructions": "Envie uma imagem do seu dispositivo:",
  "uploadImage.addViaUrlInstructions": "Ou adicione uma imagem por URL:",
  "uploadImage.addViaUrlInstructionsNoUpload": "Adicione uma imagem por URL:",
  "uploadImage.autoCompletePlaceholder": "Selecione ou cole a URL da imagem",
  "uploadImage.alt": "Texto alternativo:",
  "uploadImage.title": "Título:",
  "uploadImage.width": "Largura:",
  "uploadImage.height": "Altura:",
  "dialogControls.save": "Salvar",
  "dialogControls.cancel": "Cancelar",
  "toolbar.blockTypes.paragraph": "Parágrafo",
  "toolbar.blockTypes.quote": "Citação",
  "toolbar.blockTypes.heading": "Título {{level}}",
  "toolbar.blockTypeSelect.selectBlockTypeTooltip": "Selecionar tipo de texto",
  "toolbar.blockTypeSelect.placeholder": "Tipo de texto",
};

const translateEditor: Translation = (key, defaultValue, interpolations) => {
  const translation = editorTranslations[key] ?? defaultValue;

  return translation.replace(/{{(\w+)}}/g, (_, name: string) => {
    return String(interpolations?.[name] ?? `{{${name}}}`);
  });
};

async function uploadContentImageToImageKit(
  image: File,
  onImageUploadChange?: (isUploading: boolean) => void,
) {
  onImageUploadChange?.(true);

  const upload = uploadContentImage(image).finally(() => {
    onImageUploadChange?.(false);
  });

  toast.promise(upload, {
    loading: "Subindo imagem...",
    success: "Imagem adicionada ao conteúdo.",
    error: (error) =>
      error instanceof Error ? error.message : "Falha no upload da imagem.",
  });

  return upload;
}

async function uploadContentImage(image: File) {
  const formData = new FormData();
  formData.append("file", image);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
  const body = (await response
    .json()
    .catch(() => null)) as ContentImageUploadResponse | null;

  if (!response.ok) {
    const message = body?.error ?? "Falha no upload";
    console.error("Falha no upload da imagem do conteúdo:", message);
    throw new Error(message);
  }

  if (!body?.url) {
    throw new Error("ImageKit não retornou a URL da imagem");
  }

  return body.url;
}

const AlignDirectiveDescriptor: DirectiveDescriptor = {
  name: "align",
  testNode: (node) => node.name === "align",
  attributes: ["type"],
  hasChildren: true,
  Editor: ({ mdastNode }) => {
    const type =
      (mdastNode.attributes as { type?: Alignment } | undefined)?.type ??
      "left";
    return (
      <div style={{ textAlign: type }} data-align={type}>
        <NestedLexicalEditor
          block
          getContent={(node) =>
            (node as { children: unknown[] }).children as never
          }
          getUpdatedMdastNode={(node, children) =>
            ({ ...node, children }) as typeof node
          }
        />
      </div>
    );
  },
};

const VideoDirectiveDescriptor: DirectiveDescriptor = {
  name: "video",
  testNode: (node) => node.name === "video",
  attributes: ["url"],
  hasChildren: false,
  type: "leafDirective",
  Editor: ({ mdastNode }) => {
    const url =
      (mdastNode.attributes as { url?: string } | undefined)?.url ?? "";

    return (
      <div className="mdxeditor-video-embed" contentEditable={false}>
        <Video aria-hidden="true" size={20} />
        <div>
          <p>Vídeo incorporado</p>
          <span title={url}>{url}</span>
        </div>
      </div>
    );
  },
};

function getSupportedVideoUrl(value: string) {
  try {
    const url = new URL(value.trim());
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");

    if (
      hostname === "youtu.be" ||
      hostname === "youtube.com" ||
      hostname === "m.youtube.com"
    ) {
      const pathSegments = url.pathname.split("/").filter(Boolean);
      const id =
        hostname === "youtu.be"
          ? pathSegments[0]
          : (url.searchParams.get("v") ??
            (pathSegments[0] === "embed" || pathSegments[0] === "shorts"
              ? pathSegments[1]
              : undefined));

      return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? url.toString() : null;
    }

    if (hostname === "vimeo.com" || hostname === "player.vimeo.com") {
      const id = url.pathname
        .split("/")
        .filter(Boolean)
        .find((part) => /^\d+$/.test(part));

      return id ? url.toString() : null;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Aplica alinhamento ao bloco (imagem ou vídeo) de índice `blockIndex`.
 *
 * O MDXEditor representa o alinhamento como um container directive:
 *   :::align{type="center"}
 *   ![alt](url)
 *   :::
 *
 * A transformação é feita no markdown completo, o que evita depender das
 * APIs internas do Lexical.
 */
function alignBlockInMarkdown(
	markdown: string,
	blockIndex: number,
	direction: Alignment,
	isBlockLine: (line: string) => boolean,
): string {
	const lines = markdown.split("\n");

	// Localiza a linha do bloco N.
	let seen = 0;
	let blockLine = -1;
	for (let i = 0; i < lines.length; i++) {
		if (isBlockLine(lines[i])) {
			if (seen === blockIndex) {
				blockLine = i;
				break;
			}
			seen += 1;
		}
	}

	if (blockLine === -1) return markdown;

	// Já está dentro de um container :::align?
	let openIndex = -1;
	for (let i = blockLine - 1; i >= 0; i--) {
		const line = lines[i].trim();
		if (line.startsWith(":::")) {
			if (/^:::align\b/.test(line)) openIndex = i;
			break;
		}
	}

	if (openIndex !== -1) {
		// Atualiza o atributo type do container existente.
		lines[openIndex] = `:::align{type="${direction}"}`;
		return lines.join("\n");
	}

	// Envolve a linha do bloco num novo container.
	lines.splice(blockLine, 0, `:::align{type="${direction}"}`);
	lines.splice(blockLine + 2, 0, ":::");

	return lines.join("\n");
}

/** Alinha a imagem de índice `imageIndex`. */
function alignImageInMarkdown(
  markdown: string,
  imageIndex: number,
  direction: Alignment,
): string {
  return alignBlockInMarkdown(
    markdown,
    imageIndex,
    direction,
    (line) => /<img\b/i.test(line) || /!\[[^\]]*\]\(/.test(line),
  );
}

/** Alinha o vídeo incorporado de índice `videoIndex`. */
function alignVideoInMarkdown(
  markdown: string,
  videoIndex: number,
  direction: Alignment,
): string {
  return alignBlockInMarkdown(markdown, videoIndex, direction, (line) =>
    /::video\{/.test(line),
  );
}

/**
 * Hook compartilhado de alinhamento: usado pela toolbar e pelo overlay
 * de clique na imagem.
 */
function useAlignment() {
  const editor = useCellValue(rootEditor$);
  const insertDirective = usePublisher(insertDirective$);

  return useCallback(
    (direction: Alignment) => {
      if (!editor) return;

      let target: LexicalNode | null = null;
      let currentType: string | undefined;

      editor.getEditorState().read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;
        let node: LexicalNode | null = selection.anchor.getNode();
        while (node) {
          if (node.getType() === "directive") {
            const mdast = (
              node as unknown as {
                getMdastNode?: () => {
                  name?: string;
                  attributes?: Record<string, string>;
                };
              }
            ).getMdastNode?.();
            if (mdast?.name === "align") {
              target = node;
              currentType = mdast.attributes?.type;
              break;
            }
          }
          node = node.getParent();
        }
      });

      if (!target) {
        insertDirective({
          type: "containerDirective",
          name: "align",
          attributes: { type: direction },
        } as never);
        return;
      }

      if (currentType === direction) {
        editor.update(() => {
          const t = target as unknown as {
            getChildren: () => LexicalNode[];
            insertAfter: (n: LexicalNode) => void;
            remove: () => void;
          };
          const children = t.getChildren();
          for (let i = children.length - 1; i >= 0; i--) {
            t.insertAfter(children[i]);
          }
          t.remove();
        });
        return;
      }

      editor.update(() => {
        const t = target as unknown as {
          getMdastNode: () => { attributes?: Record<string, string> };
          setMdastNode: (n: unknown) => void;
        };
        const mdast = t.getMdastNode();
        t.setMdastNode({ ...mdast, attributes: { type: direction } });
      });
    },
    [editor, insertDirective],
  );
}

function AlignButton({
  direction,
  label,
  children,
}: {
  direction: Alignment;
  label: string;
  children: ReactNode;
}) {
  const applyAlignment = useAlignment();

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={() => applyAlignment(direction)}
      className="mdxeditor-align-button"
    >
      {children}
    </button>
  );
}

function AlignmentButtons() {
  return (
    <>
      <AlignButton direction="left" label="Alinhar à esquerda">
        <AlignLeft size={16} />
      </AlignButton>
      <AlignButton direction="center" label="Centralizar">
        <AlignCenter size={16} />
      </AlignButton>
      <AlignButton direction="right" label="Alinhar à direita">
        <AlignRight size={16} />
      </AlignButton>
    </>
  );
}

function InsertVideo() {
  const insertDirective = usePublisher(insertDirective$);

  const onClick = () => {
    const value = window.prompt(
      "Cole a URL do vídeo do YouTube ou Vimeo que deseja incorporar:",
    );

    if (value === null) return;

    const url = getSupportedVideoUrl(value);
    if (!url) {
      toast.error("Use uma URL válida do YouTube ou Vimeo.");
      return;
    }

    insertDirective({
      type: "leafDirective",
      name: "video",
      attributes: { url },
    } as never);
  };

  return (
    <button
      type="button"
      title="Inserir vídeo"
      aria-label="Inserir vídeo"
      onClick={onClick}
      className="mdxeditor-align-button"
    >
      <Video size={16} />
    </button>
  );
}

export default function InitializedMDXEditor({
	editorRef,
	onImageUploadChange,
	onChange,
	...props
}: InitializedMDXEditorProps) {
	// Estado usado apenas para reexecutar o efeito de sincronização
	// quando o bloco selecionado muda (a fonte de verdade é a ref).
	const [activeImage, setActiveImage] = useState<HTMLElement | null>(null);
	const activeImageRef = useRef<HTMLElement | null>(null);
	const activeKindRef = useRef<"image" | "video">("image");
	const activeBlockIndexRef = useRef(0);
	const [activeDirection, setActiveDirection] = useState<Alignment | null>(
		null,
	);
	const editorInstanceRef = useRef<MDXEditorMethods | null>(null);
	const wrapperRef = useRef<HTMLDivElement>(null);

	const setRefs = useCallback(
		(instance: MDXEditorMethods | null) => {
			editorInstanceRef.current = instance;
			if (typeof editorRef === "function") editorRef(instance);
			else if (editorRef) editorRef.current = instance;
		},
		[editorRef],
	);

	// Detecta clique em imagens/vídeos do conteúdo e mostra o overlay.
	useEffect(() => {
		const wrapper = wrapperRef.current;
		if (!wrapper) return;

		const handleClick = (event: MouseEvent) => {
			const target = event.target as HTMLElement | null;

			// Clique nos botões de alinhamento: não altera a seleção.
			if (target?.closest("[data-kianda-align-group]")) return;

			// Imagem ou bloco de vídeo incorporado.
			const image = target?.closest("img");
			const video = target?.closest(".mdxeditor-video-embed");
			const block = (image ?? video) as HTMLElement | null;

			if (block && wrapper.contains(block)) {
				activeImageRef.current = block;
				setActiveImage(block);
				activeKindRef.current = image ? "image" : "video";

				// Guarda o índice do bloco para reaplicar após `setMarkdown`.
				const selector = image
					? ".mdxeditor-root-contenteditable img"
					: ".mdxeditor-root-contenteditable .mdxeditor-video-embed";
				const blocks = [...wrapper.querySelectorAll<HTMLElement>(selector)];
				activeBlockIndexRef.current = blocks.indexOf(block as HTMLElement);

				const alignContainer = block.closest("[data-align]");
				setActiveDirection(
					(alignContainer?.getAttribute("data-align") as Alignment | null) ??
						null,
				);
				return;
			}

			// Qualquer outro clique (dentro ou fora do editor) fecha os botões.
			activeImageRef.current = null;
			setActiveImage(null);
			setActiveDirection(null);
		};

		// Listener global: garante que clicar fora do editor também feche.
		document.addEventListener("click", handleClick);
		return () => document.removeEventListener("click", handleClick);
	}, []);

	const handleAlign = useCallback(
		(direction: Alignment) => {
			const editor = editorInstanceRef.current;
			if (!editor || !activeImageRef.current) return;

			const blockIndex = activeBlockIndexRef.current;
			if (blockIndex < 0) return;

			const current = editor.getMarkdown();
			const next =
				activeKindRef.current === "video"
					? alignVideoInMarkdown(current, blockIndex, direction)
					: alignImageInMarkdown(current, blockIndex, direction);
			if (next === current) return;

			editor.setMarkdown(next);
			// `setMarkdown` não dispara `onChange`; notifica o formulário
			// para que o alinhamento seja persistido ao salvar.
			onChange?.(next, false);
			setActiveDirection(direction);
		},
		[onChange],
	);

	/**
	 * Injeta os botões de alinhamento ao lado da lixeira/engrenagem no popup
	 * nativo de imagem do MDXEditor, mantendo-os sincronizados.
	 */
	useEffect(() => {
		const wrapper = wrapperRef.current;
		if (!wrapper) return;

		const ALIGN_GROUP_ATTR = "data-kianda-align-group";

		const buildGroup = () => {
			const group = document.createElement("div");
			group.setAttribute(ALIGN_GROUP_ATTR, "");
			group.className = "kianda-image-align-group";
			group.setAttribute("role", "group");
			group.setAttribute("aria-label", "Alinhamento da imagem");

			const options: { value: Alignment; label: string; path: string }[] = [
				{
					value: "left",
					label: "Alinhar à esquerda",
					path: "M3 3h18v2H3V3Zm0 4h12v2H3V7Zm0 4h18v2H3v-2Zm0 4h12v2H3v-2Zm0 4h18v2H3v-2Z",
				},
				{
					value: "center",
					label: "Centralizar",
					path: "M3 3h18v2H3V3Zm3 4h12v2H6V7Zm-3 4h18v2H3v-2Zm3 4h12v2H6v-2Zm-3 4h18v2H3v-2Z",
				},
				{
					value: "right",
					label: "Alinhar à direita",
					path: "M3 3h18v2H3V3Zm6 4h12v2H9V7Zm-6 4h18v2H3v-2Zm6 4h12v2H9v-2Zm-6 4h18v2H3v-2Z",
				},
			];

			for (const option of options) {
				const button = document.createElement("button");
				button.type = "button";
				button.title = option.label;
				button.setAttribute("aria-label", option.label);
				button.dataset.align = option.value;
				button.className = "kianda-image-align-group__button";

				const svg = document.createElementNS(
					"http://www.w3.org/2000/svg",
					"svg",
				);
				svg.setAttribute("viewBox", "0 0 24 24");
				svg.setAttribute("width", "16");
				svg.setAttribute("height", "16");
				svg.setAttribute("aria-hidden", "true");
				const path = document.createElementNS(
					"http://www.w3.org/2000/svg",
					"path",
				);
				path.setAttribute("d", option.path);
				path.setAttribute("fill", "currentColor");
				svg.appendChild(path);
				button.appendChild(svg);

				button.addEventListener("click", (event) => {
					event.preventDefault();
					event.stopPropagation();
					handleAlign(option.value);
				});

				group.appendChild(button);
			}

			return group;
		};

		const removeGroups = () => {
			for (const node of wrapper.querySelectorAll(`[${ALIGN_GROUP_ATTR}]`)) {
				node.remove();
			}
		};

		const sync = () => {
			// Só exibe os botões quando o usuário clicou em um bloco.
			const block = activeImageRef.current;
			if (!activeImage || !block) {
				removeGroups();
				return;
			}

			// Após `setMarkdown`, o DOM do bloco é recriado. Reaponta a ref para o
			// elemento atual usando o índice salvo, para permitir trocar o
			// alinhamento várias vezes seguidas.
			const selector =
				activeKindRef.current === "video"
					? ".mdxeditor-root-contenteditable .mdxeditor-video-embed"
					: ".mdxeditor-root-contenteditable img";
			const blocks = [...wrapper.querySelectorAll<HTMLElement>(selector)];
			const sameIndex = blocks[activeBlockIndexRef.current];
			if (sameIndex) activeImageRef.current = sameIndex;

			const current = activeImageRef.current;
			if (!current) {
				removeGroups();
				return;
			}

			// Âncora: sempre o bloco clicado (imagem ou vídeo).
			const anchor = current;

			let group = wrapper.querySelector<HTMLElement>(`[${ALIGN_GROUP_ATTR}]`);
			if (!group) {
				group = buildGroup();
			}

			// Posiciona o grupo sobre o bloco selecionado usando coordenadas da
			// viewport (position: fixed), o que evita problemas de offsetParent.
			const rect = anchor.getBoundingClientRect();
			group.style.top = `${rect.top + 4}px`;
			group.style.left = `${rect.left + rect.width / 2}px`;

			if (!group.isConnected) wrapper.appendChild(group);

			const direction =
				current.closest("[data-align]")?.getAttribute("data-align") ??
				activeDirection;

			for (const button of group.querySelectorAll<HTMLButtonElement>(
				"[data-align]",
			)) {
				const isActive = button.dataset.align === direction;
				button.setAttribute("aria-pressed", String(isActive));
				button.dataset.active = isActive ? "" : "false";
			}
		};

		sync();

		const observer = new MutationObserver(sync);
		observer.observe(wrapper, { childList: true, subtree: true });
		window.addEventListener("scroll", sync, true);
		window.addEventListener("resize", sync);

		return () => {
			observer.disconnect();
			window.removeEventListener("scroll", sync, true);
			window.removeEventListener("resize", sync);
		};
	}, [activeDirection, activeImage, handleAlign]);

	return (
		<div ref={wrapperRef} className="mdxeditor-image-align-wrapper">
			<MDXEditor
				contentEditableClassName="prose max-w-none focus:outline-none"
				translation={translateEditor}
				plugins={[
					headingsPlugin(),
					listsPlugin(),
					quotePlugin(),
					thematicBreakPlugin(),
					linkPlugin(),
					linkDialogPlugin(),
					imagePlugin({
						imageUploadHandler: (image) =>
							uploadContentImageToImageKit(image, onImageUploadChange),
					}),
					tablePlugin(),
					directivesPlugin({
						directiveDescriptors: [
							AlignDirectiveDescriptor,
							VideoDirectiveDescriptor,
						],
					}),
					diffSourcePlugin({ viewMode: "rich-text" }),
					markdownShortcutPlugin(),
					toolbarPlugin({
						toolbarContents: () => (
							<>
								<UndoRedo />
								<Separator />
								<BoldItalicUnderlineToggles />
								<Separator />
								<BlockTypeSelect />
								<Separator />
								<ListsToggle />
								<Separator />
								<AlignmentButtons />
								<Separator />
								<CreateLink />
								<InsertImage />
								<InsertVideo />
								<InsertTable />
								<InsertThematicBreak />
							</>
						),
					}),
				]}
				{...props}
				onChange={onChange}
				ref={setRefs}
			/>
		</div>
	);
}
