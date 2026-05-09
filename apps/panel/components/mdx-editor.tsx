import type { ForwardedRef, ReactNode } from 'react'
import { AlignCenter, AlignLeft, AlignRight } from 'lucide-react'
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CreateLink,
  type DirectiveDescriptor,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  MDXEditor,
  type MDXEditorMethods,
  type MDXEditorProps,
  NestedLexicalEditor,
  Separator,
  UndoRedo,
  diffSourcePlugin,
  directivesPlugin,
  headingsPlugin,
  imagePlugin,
  insertDirective$,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  rootEditor$,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  useCellValue,
  usePublisher,
} from '@mdxeditor/editor'
import { $getSelection, $isRangeSelection, type LexicalNode } from 'lexical'
import '@mdxeditor/editor/style.css'
import './mdx-editor.css'

type Alignment = 'left' | 'center' | 'right'

const AlignDirectiveDescriptor: DirectiveDescriptor = {
  name: 'align',
  testNode: (node) => node.name === 'align',
  attributes: ['type'],
  hasChildren: true,
  Editor: ({ mdastNode }) => {
    const type = (mdastNode.attributes as { type?: Alignment } | undefined)?.type ?? 'left'
    return (
      <div style={{ textAlign: type }} data-align={type}>
        <NestedLexicalEditor
          block
          getContent={(node) => (node as { children: unknown[] }).children as never}
          getUpdatedMdastNode={(node, children) =>
            ({ ...node, children } as typeof node)
          }
        />
      </div>
    )
  },
}

function AlignButton({
  direction,
  label,
  children,
}: {
  direction: Alignment
  label: string
  children: ReactNode
}) {
  const editor = useCellValue(rootEditor$)
  const insertDirective = usePublisher(insertDirective$)

  const onClick = () => {
    if (!editor) return

    let target: LexicalNode | null = null
    let currentType: string | undefined

    editor.getEditorState().read(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return
      let node: LexicalNode | null = selection.anchor.getNode()
      while (node) {
        if (node.getType() === 'directive') {
          const mdast = (node as unknown as { getMdastNode?: () => { name?: string; attributes?: Record<string, string> } })
            .getMdastNode?.()
          if (mdast?.name === 'align') {
            target = node
            currentType = mdast.attributes?.type
            break
          }
        }
        node = node.getParent()
      }
    })

    if (!target) {
      insertDirective({
        type: 'containerDirective',
        name: 'align',
        attributes: { type: direction },
      } as never)
      return
    }

    if (currentType === direction) {
      editor.update(() => {
        const t = target as unknown as {
          getChildren: () => LexicalNode[]
          insertAfter: (n: LexicalNode) => void
          remove: () => void
        }
        const children = t.getChildren()
        for (let i = children.length - 1; i >= 0; i--) {
          t.insertAfter(children[i])
        }
        t.remove()
      })
      return
    }

    editor.update(() => {
      const t = target as unknown as {
        getMdastNode: () => { attributes?: Record<string, string> }
        setMdastNode: (n: unknown) => void
      }
      const mdast = t.getMdastNode()
      t.setMdastNode({ ...mdast, attributes: { type: direction } })
    })
  }

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
  )
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
  )
}

export default function InitializedMDXEditor({
  editorRef,
  ...props
}: { editorRef?: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
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
          imageUploadHandler: async (image) => {
            const formData = new FormData()
            formData.append('file', image)
            const res = await fetch('/api/upload', {
              method: 'POST',
              body: formData,
            })
            if (!res.ok) {
              const { error } = await res.json().catch(() => ({ error: 'Falha no upload' }))
              throw new Error(error)
            }
            const { url } = await res.json()
            return url
          },
        }),
        tablePlugin(),
        directivesPlugin({ directiveDescriptors: [AlignDirectiveDescriptor] }),
        diffSourcePlugin({ viewMode: 'rich-text' }),
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
  )
}
