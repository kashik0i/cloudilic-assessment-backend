import { DataSource, QueryRunner } from "typeorm";
import type { ChunkRepository as IChunkRepository } from "../interfaces/repositories/ChunkRepository";

export class ChunkRepository implements IChunkRepository {
  constructor(private readonly ds: DataSource) {}

  async insertMany(
    chunks: Array<{ documentId: string; content: string; embedding: number[] }>,
    opts?: { queryRunner?: QueryRunner }
  ): Promise<number> {
    if (!chunks.length) return 0;
    const runner = opts?.queryRunner;
    const manager = runner?.manager ?? this.ds.manager;

    // Store vector as '[1,2,...]' text and cast to vector at insert time using raw query for performance
    const values = chunks.map((c) => [c.documentId, c.content, `[${c.embedding.join(',')}]`]);

    const params: any[] = [];
    const tuples = values
      .map((row, i) => {
        const offset = i * 3;
        params.push(row[0], row[1], row[2]);
        return `($${offset + 1}, $${offset + 2}, $${offset + 3}::vector)`;
      })
      .join(",");

    await manager.query(
      `INSERT INTO chunks (document_id, content, embedding) VALUES ${tuples}`,
      params
    );

    return chunks.length;
  }

  async searchByDocument(
    documentId: string,
    queryVector: number[],
    limit: number
  ): Promise<Array<{ content: string; score: number }>> {
    const vec = `[${queryVector.join(',')}]`;
    const rows = await this.ds.query(
      `SELECT content, (embedding <-> $2::vector) AS score
       FROM chunks
       WHERE document_id = $1
       ORDER BY embedding <-> $2::vector
       LIMIT $3`,
      [documentId, vec, limit]
    );
    return rows as Array<{ content: string; score: number }>;
  }
}
