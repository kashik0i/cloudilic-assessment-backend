import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from "typeorm";

/**
 * EmbeddingCache Entity
 * Caches embeddings to avoid recomputing identical text embeddings
 */
@Entity("embedding_cache")
export class EmbeddingCache {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id!: string;

  @Column("text", { name: "text_hash", unique: true })
  @Index("idx_embedding_cache_hash")
  textHash!: string;

  @Column("text")
  content!: string;

  /**
   * Vector embedding column (1536 dimensions for text-embedding-3-small)
   * Note: TypeORM doesn't natively support vector type, so we use 'text' 
   * and handle conversion in repository layer
   */
  @Column("text")
  embedding!: string; // Will store as pgvector format

  @CreateDateColumn({ 
    name: "created_at",
    type: "timestamptz",
    default: () => "now()"
  })
  createdAt!: Date;
}

