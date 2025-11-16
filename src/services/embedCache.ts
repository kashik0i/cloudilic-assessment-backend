import crypto from 'crypto';
import type { EmbeddingCacheRepository } from '../interfaces/repositories/EmbeddingCacheRepository';

export function hashText(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

export async function getOrEmbedWithRepo(repo: EmbeddingCacheRepository, embed: (t: string) => Promise<number[]>, text: string): Promise<number[]> {
  const h = hashText(text);
  const cached = await repo.getByHash(h);
  if (cached?.embedding?.length) return cached.embedding;
  const emb = await embed(text);
  await repo.upsert({ text, textHash: h, embedding: emb });
  return emb;
}
