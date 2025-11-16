import type ChatService from "../interfaces/services/ChatService";
import type { ChatServiceDeps } from "../types/container";

export class ChatServiceImpl implements ChatService {
  constructor(private readonly c: ChatServiceDeps) {}

  async respond(input: { prompt: string; sessionId?: string; documentId?: string; topK?: number }) {
    const { prompt, sessionId: providedSession, documentId, topK = 5 } = input;
    const { sessions, interactions, chunks } = this.c.repos;
    const { embedder } = this.c.services;

    const sessionId = await sessions.ensure(providedSession);
    await interactions.add(sessionId, 'user', prompt);

    const memoryRows = await interactions.findRecentBySession(sessionId, 10);

    let contextDocs: string[] = [];
    if (documentId) {
      const queryEmb = await embedder.embedCached(prompt);
      const results = await chunks.searchByDocument(documentId, queryEmb, topK);
      contextDocs = results.map((r: { content: string }) => r.content);
    }

    const memoryStr = memoryRows.map((m: { role: string; content: string }) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');

    let completionPrompt: string;
    let systemMessage: string;

    if (contextDocs.length > 0) {
      const context = contextDocs.join('\n\n');
      systemMessage = "You are a helpful assistant. Prioritize using the provided context from the document to answer questions. If the context doesn't contain enough information to fully answer the question, you may supplement with your general knowledge.";
      completionPrompt = `Conversation Memory:\n${memoryStr}\n\nRetrieved Context:\n${context}\n\nUser Question:\n${prompt}`;
    } else {
      systemMessage = "You are a helpful AI assistant. Provide accurate and helpful responses based on your knowledge and the conversation history.";
      completionPrompt = memoryStr ? `Conversation Memory:\n${memoryStr}\n\nUser Question:\n${prompt}` : `User Question:\n${prompt}`;
    }

    const answer = await embedder.getCompletion(completionPrompt, systemMessage);
    await interactions.add(sessionId, 'assistant', answer);

    return { sessionId, answer, retrievedCount: contextDocs.length };
  }
}

export default ChatServiceImpl;


