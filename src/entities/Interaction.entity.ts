import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Check } from "typeorm";
import { Session } from "./Session.entity";

/**
 * Interaction Entity
 * Represents individual messages in a chat session (short-term memory)
 */
@Entity("interactions")
@Check(`"role" IN ('user', 'assistant')`)
export class Interaction {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id!: string;

  @Column("text", { name: "session_id" })
  sessionId!: string;

  @Column("text")
  role!: "user" | "assistant";

  @Column("text")
  content!: string;

  @CreateDateColumn({ 
    name: "created_at",
    type: "timestamptz",
    default: () => "now()"
  })
  createdAt!: Date;

  // Relations
  @ManyToOne(() => Session, (session) => session.interactions, {
    onDelete: "CASCADE"
  })
  @JoinColumn({ name: "session_id" })
  session?: Session;
}

// Index is created via schema.sql:
// - idx_interactions_session_created (for session history retrieval)

