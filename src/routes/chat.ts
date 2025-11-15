import type { Router as ExpressRouter } from 'express';
import { Router } from 'express';
import { pool } from '../../db';
import { embedTextCached, getCompletion } from '../services/embedder';

const router: ExpressRouter = Router();
// NOTE: The SQL table name resolution errors reported by static analysis tools may persist until the migration in schema.sql is applied to the database.

// Helper: fetch recent memory (last N interactions)
async function fetchMemory(sessionId: string, limit = 10): Promise<{role: string, content: string}[]> {
  const res = await pool.query('SELECT role, content FROM interactions WHERE session_id = $1 ORDER BY created_at DESC LIMIT $2', [sessionId, limit]);
  return res.rows.reverse(); // chronological
}

async function ensureSession(sessionId?: string): Promise<string> {
  if (sessionId) {
    const exists = await pool.query('SELECT 1 FROM sessions WHERE id = $1', [sessionId]);
    if (exists.rows[0]) return sessionId;
  }
  const newId = Date.now().toString();
  await pool.query('INSERT INTO sessions(id) VALUES ($1)', [newId]);
  return newId;
}

router.post('/chat', async (req, res) => {
  try {
    const { prompt, documentId, sessionId: providedSession, topK = 5 } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Missing prompt' });
    }

    const sessionId = await ensureSession(providedSession);

    // Persist user message early
    await pool.query('INSERT INTO interactions(session_id, role, content) VALUES ($1, $2, $3)', [sessionId, 'user', prompt]);

    const memory = await fetchMemory(sessionId, 10);

    let contextDocs: string[] = [];

    // Only perform RAG if documentId is provided
    if (documentId) {
      // Embed query (cached)
      const queryEmb = await embedTextCached(prompt);
      const queryVector = `[${queryEmb.join(',')}]`;

      const chunkRes = await pool.query(
        'SELECT content FROM chunks WHERE document_id = $1 ORDER BY embedding <-> $2::vector LIMIT $3',
        [documentId, queryVector, topK]
      );
      contextDocs = chunkRes.rows.map(r => r.content);
    }

    const memoryStr = memory.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');

    let completionPrompt: string;
    let systemMessage: string;

    if (contextDocs.length > 0) {
      // RAG mode: Use retrieved context
      const context = contextDocs.join('\n\n');
      systemMessage = "You are a helpful assistant. Prioritize using the provided context from the document to answer questions. If the context doesn't contain enough information to fully answer the question, you may supplement with your general knowledge.";
      completionPrompt = `Conversation Memory:\n${memoryStr}\n\nRetrieved Context:\n${context}\n\nUser Question:\n${prompt}`;
    } else {
      // No RAG: General conversation mode
      systemMessage = "You are a helpful AI assistant. Provide accurate and helpful responses based on your knowledge and the conversation history.";
      completionPrompt = memoryStr
        ? `Conversation Memory:\n${memoryStr}\n\nUser Question:\n${prompt}`
        : `User Question:\n${prompt}`;
    }

    const answer = await getCompletion(completionPrompt, systemMessage);

    await pool.query('INSERT INTO interactions(session_id, role, content) VALUES ($1, $2, $3)', [sessionId, 'assistant', answer]);

    res.json({ sessionId, answer, retrievedCount: contextDocs.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Chat failed' });
  }
});

export default router;
