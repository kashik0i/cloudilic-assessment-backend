export interface ChatService {
  respond(input: {
    prompt: string;
    sessionId?: string;
    documentId?: string;
    topK?: number;
  }): Promise<{ sessionId: string; answer: string; retrievedCount: number }>;
}

export default ChatService;

