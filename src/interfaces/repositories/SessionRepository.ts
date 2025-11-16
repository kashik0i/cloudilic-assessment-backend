export interface SessionRepository {
  ensure(sessionId?: string): Promise<string>;
  exists(id: string): Promise<boolean>;
}

export default SessionRepository;

