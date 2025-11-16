export interface ChunkRepository {
  insertMany(chunks: Array<{ documentId: string; content: string; embedding: number[] }>, opts?: { queryRunner?: any }): Promise<number>;
  searchByDocument(documentId: string, queryVector: number[], limit: number): Promise<Array<{ content: string; score: number }>>;
}

export default ChunkRepository;

