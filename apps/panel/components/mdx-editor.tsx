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
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
  useCellValue,
  usePublisher,
} from "@mdxeditor/editor";
import { $getSelection, $isRangeSelection, type LexicalNode } from "lexical";
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import type { ForwardedRef, ReactNode } from "react";
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

function AlignButton({
  direction,
  label,
  children,
}: {
  direction: Alignment;
  label: string;
  children: ReactNode;
}) {
  const editor = useCellValue(rootEditor$);
  const insertDirective = usePublisher(insertDirective$);

  const onClick = () => {
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
  };

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
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

export default function InitializedMDXEditor({
  editorRef,
  onImageUploadChange,
  ...props
}: InitializedMDXEditorProps) {
  return (
    <MDXEditor
      contentEditableClassName="prose max-w-none focus:outline-none"
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
        directivesPlugin({ directiveDescriptors: [AlignDirectiveDescriptor] }),
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
              <InsertTable />
              <InsertThematicBreak />
            </>
          ),
        }),
      ]}
      {...props}
      ref={editorRef}
    />
  );
}
