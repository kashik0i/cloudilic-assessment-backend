import { DataSource } from "typeorm";
import { Session } from "../entities";
import type { SessionRepository as ISessionRepository } from "../interfaces/repositories/SessionRepository";

export class SessionRepository implements ISessionRepository {
  constructor(private readonly ds: DataSource) {}

  async ensure(sessionId?: string): Promise<string> {
    const repo = this.ds.getRepository(Session);
    const id = sessionId ?? Date.now().toString();
    const existing = await repo.findOne({ where: { id } });
    if (existing) return id;
    await repo.save(repo.create({ id }));
    return id;
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.ds.getRepository(Session).count({ where: { id } });
    return count > 0;
  }
}
