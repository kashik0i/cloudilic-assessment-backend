import type { Router as ExpressRouter } from 'express';
import { Router } from 'express';
import { validateBody } from '../middleware/validate';
import { ChatRequestSchema } from '../types/dto/chat';

const router: ExpressRouter = Router();

router.post('/chat', validateBody(ChatRequestSchema), async (req, res, next) => {
  try {
    const { chatService } = req.container!.services;
    const { prompt, documentId, sessionId, topK } = req.body as { prompt: string; documentId?: string; sessionId?: string; topK?: number };
    req.log?.info({ promptLen: prompt?.length ?? 0, hasDocumentId: !!documentId, hasSessionId: !!sessionId, topK }, 'Chat request received');

    const result = await chatService.respond(req.body);

    req.log?.info({ sessionId: result.sessionId, retrievedCount: result.retrievedCount }, 'Chat response generated');
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
