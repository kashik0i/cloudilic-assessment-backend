import { z } from "zod";

export const ChatRequestSchema = z.object({
  prompt: z.string().min(1).max(4000),
  documentId: z.string().min(1).optional(),
  sessionId: z.string().min(1).optional(),
  topK: z.number().int().min(1).max(50).optional(),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

export type ChatResponse = {
  sessionId: string;
  answer: string;
  retrievedCount: number;
};

