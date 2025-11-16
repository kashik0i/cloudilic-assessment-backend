export interface EmbeddingCacheRepository {
  getByHash(textHash: string): Promise<{ embedding: number[]; content: string } | null>;
  upsert(args: { text: string; textHash: string; embedding: number[] }): Promise<void>;
}

export default EmbeddingCacheRepository;

