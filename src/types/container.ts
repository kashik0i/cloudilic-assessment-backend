import type ChatService from "../interfaces/services/ChatService";
import type Embedder from "../interfaces/services/Embedder";
import type PDFParser from "../interfaces/services/PDFParser";
import type { ChunkRepository } from "../interfaces/repositories/ChunkRepository";
import type { DocumentRepository } from "../interfaces/repositories/DocumentRepository";
import type { EmbeddingCacheRepository } from "../interfaces/repositories/EmbeddingCacheRepository";
import type { InteractionRepository } from "../interfaces/repositories/InteractionRepository";
import type { SessionRepository } from "../interfaces/repositories/SessionRepository";
import type { Logger } from "pino";


/**
 * Application services container
 */
export interface AppServices {
  embedder: Embedder;
  pdfParser: PDFParser;
  chatService: ChatService;
}

/**
 * Application repositories container
 */
export interface AppRepos {
  documents: DocumentRepository;
  chunks: ChunkRepository;
  sessions: SessionRepository;
  interactions: InteractionRepository;
  embedCache: EmbeddingCacheRepository;
}

/**
 * Main application container holding all dependencies
 */
export interface AppContainer {
  services: AppServices;
  repos: AppRepos;
  logger: Logger;
}

/**
 * Dependencies required for ChatService
 */
export type ChatServiceDeps = {
  services: Pick<AppServices, 'embedder'>;
  repos: Pick<AppRepos, 'sessions' | 'interactions' | 'chunks'>;
};
