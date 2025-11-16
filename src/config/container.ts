import type { DataSource } from "typeorm";
import type Embedder from "../interfaces/services/Embedder";
import type PDFParser from "../interfaces/services/PDFParser";
import type { AppContainer } from "../types/container";
import { createLogger } from "./logger";

// Adapters to current concrete services
import { embedText, getCompletion } from "../services/embedder";
import { extractPdfText } from "../services/pdfParser";
import { DocumentRepository } from "../repositories/DocumentRepository";
import { ChunkRepository } from "../repositories/ChunkRepository";
import { SessionRepository } from "../repositories/SessionRepository";
import { InteractionRepository } from "../repositories/InteractionRepository";
import { EmbeddingCacheRepository } from "../repositories/EmbeddingCacheRepository";
import { getOrEmbedWithRepo } from "../services/embedCache";
import ChatServiceImpl from "../services/chatService";


export function makeContainer(ds: DataSource, _env: NodeJS.ProcessEnv): AppContainer {
  const logger = createLogger();

  const repos = {
    documents: new DocumentRepository(ds),
    chunks: new ChunkRepository(ds),
    sessions: new SessionRepository(ds),
    interactions: new InteractionRepository(ds),
    embedCache: new EmbeddingCacheRepository(ds),
  };

  const embedder: Embedder = {
    embed: embedText,
    embedCached: (text: string) => getOrEmbedWithRepo(repos.embedCache, embedText, text),
    getCompletion,
  };

  const pdfParser: PDFParser = { parse: extractPdfText };

  const base = { services: {} as any, repos };
  const chatService = new ChatServiceImpl({ ...base, services: { ...base.services, embedder, pdfParser } });

  return {
    services: { embedder, pdfParser, chatService },
    repos,
    logger,
  };
}
