import { Entity, PrimaryColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { Chunk } from "./Chunk.entity";

/**
 * Document Entity
 * Represents uploaded PDF documents
 */
@Entity("documents")
export class Document {
  @PrimaryColumn("text")
  id!: string;

  @Column("text", { name: "filename" })
  filename!: string;

  @CreateDateColumn({
    name: "created_at",
    type: "timestamptz",
    default: () => "now()"
  })
  createdAt!: Date;

  // Relations
  @OneToMany(() => Chunk, (chunk) => chunk.document, {
    cascade: true,
    onDelete: "CASCADE"
  })
  chunks?: Chunk[];
}
