import { DataSource } from "typeorm";
import { Interaction } from "../entities";
import type { InteractionRepository as IInteractionRepository } from "../interfaces/repositories/InteractionRepository";

export class InteractionRepository implements IInteractionRepository {
  constructor(private readonly ds: DataSource) {}

  async add(sessionId: string, role: 'user' | 'assistant', content: string): Promise<{ id: string }> {
    const repo = this.ds.getRepository(Interaction);
    const saved = await repo.save(repo.create({ sessionId, role, content }));
    return { id: saved.id };
    
  }

  async findRecentBySession(sessionId: string, limit: number): Promise<Array<{ role: string; content: string; createdAt: Date }>> {
    const rows = await this.ds.getRepository(Interaction).find({
      where: { sessionId },
      order: { createdAt: "DESC" },
      take: limit,
      select: { role: true, content: true, createdAt: true, id: false, sessionId: false }
    });
    return rows.reverse();
  }
}

