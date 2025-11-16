import { DataSource } from "typeorm";
import { EmbeddingCache } from "../entities";
import type { EmbeddingCacheRepository as IEmbeddingCacheRepository } from "../interfaces/repositories/EmbeddingCacheRepository";

export class EmbeddingCacheRepository implements IEmbeddingCacheRepository {
  constructor(private readonly ds: DataSource) {}

  async getByHash(textHash: string): Promise<{ embedding: number[]; content: string } | null> {
    const row = await this.ds.getRepository(EmbeddingCache).findOne({ where: { textHash } });
    if (!row) return null;
    // Stored as pgvector literal string '[...]' -> convert to array of numbers
    const trimmed = row.embedding.trim();
    const inner = trimmed.startsWith('[') && trimmed.endsWith(']') ? trimmed.slice(1, -1) : trimmed;
    const embedding = inner ? inner.split(',').map((v) => Number(v.trim())) : [];
    return { embedding, content: row.content };
  }

  async upsert(args: { text: string; textHash: string; embedding: number[] }): Promise<void> {
    const repo = this.ds.getRepository(EmbeddingCache);
    const literal = `[${args.embedding.join(',')}]`;
    await repo.upsert({ textHash: args.textHash, content: args.text, embedding: literal } as any, {
      conflictPaths: ["textHash"],
    });
  }
}
