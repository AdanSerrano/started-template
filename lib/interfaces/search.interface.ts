/**
 * Interface para servicios de busqueda.
 * Permite cambiar entre pg_trgm, Meilisearch, Algolia, etc.
 */

export interface SearchOptions {
  query: string
  filters?: Record<string, unknown>
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  facets?: string[]
  highlightFields?: string[]
}

export interface SearchHit<T = Record<string, unknown>> {
  id: string
  score: number
  document: T
  highlights?: Record<string, string>
}

export interface SearchFacet {
  field: string
  values: { value: string; count: number }[]
}

export interface SearchResult<T = Record<string, unknown>> {
  hits: SearchHit<T>[]
  total: number
  page: number
  pageSize: number
  facets?: SearchFacet[]
  queryTimeMs: number
}

export interface IndexDocument {
  id: string
  index: string
  document: Record<string, unknown>
}

export interface ISearchService {
  search<T = Record<string, unknown>>(
    index: string,
    options: SearchOptions,
  ): Promise<SearchResult<T>>

  index(doc: IndexDocument): Promise<void>
  indexBulk(docs: IndexDocument[]): Promise<void>
  remove(index: string, id: string): Promise<void>
  reindex(index: string): Promise<void>
}
