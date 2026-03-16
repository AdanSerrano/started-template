/**
 * PostgreSQL full-text search adapter.
 *
 * Usa pg_trgm y tsvector para busqueda en PostgreSQL.
 * Para produccion con alto volumen, migrar a Meilisearch o Algolia.
 */

import type {
  ISearchService,
  SearchOptions,
  SearchResult,
  IndexDocument,
} from '@/lib/interfaces/search.interface'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

export class PgSearchService implements ISearchService {
  async search<T = Record<string, unknown>>(
    index: string,
    options: SearchOptions,
  ): Promise<SearchResult<T>> {
    const start = performance.now()
    const page = options.page ?? 1
    const pageSize = options.pageSize ?? 20
    const offset = (page - 1) * pageSize

    // Busqueda usando ts_rank y to_tsvector
    const result = await db.execute(sql`
      SELECT
        id,
        document,
        ts_rank(
          to_tsvector('spanish', document::text),
          plainto_tsquery('spanish', ${options.query})
        ) as score
      FROM search_index
      WHERE index_name = ${index}
        AND to_tsvector('spanish', document::text)
            @@ plainto_tsquery('spanish', ${options.query})
      ORDER BY score DESC
      LIMIT ${pageSize}
      OFFSET ${offset}
    `)

    const countResult = await db.execute(sql`
      SELECT count(*)::int as total
      FROM search_index
      WHERE index_name = ${index}
        AND to_tsvector('spanish', document::text)
            @@ plainto_tsquery('spanish', ${options.query})
    `)

    const total = (countResult.rows[0] as { total: number })?.total ?? 0
    const queryTimeMs = Math.round(performance.now() - start)

    return {
      hits: (result.rows as { id: string; document: T; score: number }[]).map(
        (row) => ({
          id: row.id,
          score: row.score,
          document: row.document,
        }),
      ),
      total,
      page,
      pageSize,
      queryTimeMs,
    }
  }

  async index(doc: IndexDocument): Promise<void> {
    await db.execute(sql`
      INSERT INTO search_index (id, index_name, document)
      VALUES (${doc.id}, ${doc.index}, ${JSON.stringify(doc.document)}::jsonb)
      ON CONFLICT (id, index_name) DO UPDATE
      SET document = ${JSON.stringify(doc.document)}::jsonb
    `)
  }

  async indexBulk(docs: IndexDocument[]): Promise<void> {
    for (const doc of docs) {
      await this.index(doc)
    }
  }

  async remove(index: string, id: string): Promise<void> {
    await db.execute(sql`
      DELETE FROM search_index
      WHERE id = ${id} AND index_name = ${index}
    `)
  }

  async reindex(_index: string): Promise<void> {
    // La reindexacion depende de la logica de negocio.
    // Implementar en el servicio que usa el search.
  }
}
