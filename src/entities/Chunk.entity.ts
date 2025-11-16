import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Document } from "./Document.entity";

/**
 * Chunk Entity
 * Represents text chunks with vector embeddings from documents
 * Uses pgvector extension for similarity search
 */
@Entity("chunks")
export class Chunk {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id!: string;

  @Column("text", { name: "document_id" })
  documentId!: string;

  @Column("text")
  content!: string;

  /**
   * Vector embedding column (1536 dimensions for text-embedding-3-small)
   * Note: TypeORM doesn't natively support vector type, so we use 'text' 
   * and handle conversion in repository layer
   */
  @Column("text")
  embedding!: string; // Will store as pgvector format

  // Relations
  @ManyToOne(() => Document, (document) => document.chunks, {
    onDelete: "CASCADE"
  })
  @JoinColumn({ name: "document_id" })
  document?: Document;
}

// Indexes are created via schema.sql:
// - idx_chunks_embedding_ivfflat (for ANN search)
// - idx_chunks_document_id (for document lookups)

