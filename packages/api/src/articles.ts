type CreatedBy = {
  firstname?: string | null
  lastname?: string | null
}

export type Article = {
  id: number
  documentId: string
  Titulo: string
  Resumo: string
  Conteudo: string
  Publicacao: string
  Destaque: boolean
  Capa: {
    id: string | number
    name: string
    alternativeText?: string
    width: number
    heigth: number
    ext: string
    url: string
  }
  publishedAt: string | null
  createdBy?: CreatedBy
}

export type ArticleStatus = 'published' | 'draft'

export function getArticleStatus(article: Pick<Article, 'publishedAt'>): ArticleStatus {
  return article.publishedAt ? 'published' : 'draft'
}

function authHeaders(): HeadersInit {
  const token = process.env.API_TOKEN
  if (!token) throw new Error('API_TOKEN is not set')
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

function baseUrl(): string {
  const url = process.env.API_BASE_URL
  if (!url) throw new Error('API_BASE_URL is not set')
  return url
}

const POPULATE = 'populate[0]=Capa&populate[1]=createdBy'

export type GetArticlesOptions = {
  includeDrafts?: boolean
}

export async function getArticles(
  options: GetArticlesOptions = {},
): Promise<Article[] | null> {
  const headers = authHeaders()

  if (!options.includeDrafts) {
    const res = await fetch(`${baseUrl()}/api/articles?${POPULATE}`, {
      headers,
      cache: 'no-cache',
    })
    if (!res.ok) return null
    const { data } = (await res.json()) as { data: Article[] }
    return data
  }

  const [publishedRes, draftRes] = await Promise.all([
    fetch(`${baseUrl()}/api/articles?${POPULATE}&status=published`, {
      headers,
      cache: 'no-cache',
    }),
    fetch(`${baseUrl()}/api/articles?${POPULATE}&status=draft`, {
      headers,
      cache: 'no-cache',
    }),
  ])

  if (!publishedRes.ok || !draftRes.ok) return null

  const published = ((await publishedRes.json()) as { data: Article[] }).data
  const drafts = ((await draftRes.json()) as { data: Article[] }).data

  // Strapi v5: every document has a draft "working copy" with publishedAt=null,
  // even after being published. Prefer the published entry — it carries the real
  // publishedAt. Documents that only show up in drafts never went live.
  const byDocumentId = new Map<string, Article>()
  for (const article of drafts) byDocumentId.set(article.documentId, article)
  for (const article of published) byDocumentId.set(article.documentId, article)
  return Array.from(byDocumentId.values())
}

type NextFetchInit = RequestInit & { next?: { revalidate?: number } }

export async function getArticleById(
  documentId: string,
): Promise<Article | null> {
  const init: NextFetchInit = {
    headers: authHeaders(),
    next: { revalidate: 30 },
  }
  const response = await fetch(
    `${baseUrl()}/api/articles/${documentId}?${POPULATE}`,
    init,
  )
  if (!response.ok) return null
  const { data } = (await response.json()) as { data: Article }
  return data
}

export async function deleteArticle(documentId: string): Promise<boolean> {
  const response = await fetch(`${baseUrl()}/api/articles/${documentId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  return response.ok
}
