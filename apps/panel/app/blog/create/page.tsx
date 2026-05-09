'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const EditorComp = dynamic(() => import('@/components/mdx-editor'), { ssr: false })

const markdown = `
Hello **world**!
`

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EditorComp markdown={markdown} />
        </Suspense>
    )
}