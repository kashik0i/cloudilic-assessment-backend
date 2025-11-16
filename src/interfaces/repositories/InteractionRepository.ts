export interface InteractionRepository {
  add(sessionId: string, role: 'user' | 'assistant', content: string): Promise<{ id: string }>;
  findRecentBySession(sessionId: string, limit: number): Promise<Array<{ role: string; content: string; createdAt: Date }>>;
}

export default InteractionRepository;

