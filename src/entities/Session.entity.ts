import { Entity, PrimaryColumn, CreateDateColumn, OneToMany } from "typeorm";
import { Interaction } from "./Interaction.entity";

/**
 * Session Entity
 * Represents chat sessions for conversational context
 */
@Entity("sessions")
export class Session {
  @PrimaryColumn("text")
  id!: string;

  @CreateDateColumn({ 
    name: "created_at",
    type: "timestamptz",
    default: () => "now()"
  })
  createdAt!: Date;

  // Relations
  @OneToMany(() => Interaction, (interaction) => interaction.session, {
    cascade: true,
    onDelete: "CASCADE"
  })
  interactions?: Interaction[];
}

