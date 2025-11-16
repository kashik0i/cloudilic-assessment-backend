# Cloudilic Assessment Backend

Simple RAG backend with PDF upload, chunking + embeddings to Postgres (pgvector), and querying via OpenAI.

## Prerequisites
- Node.js 20+
- pnpm
- Docker (for Postgres + pgvector)
- OpenAI API key

## Setup

1. Copy env
```bash
cp .env.example .env
# edit .env and set OPENAI_API_KEY and DATABASE_URL
```

2. Start Postgres with pgvector
```bash
docker compose -f docker-coompose.yml up -d
```

3. Create schema
```bash
psql "$DATABASE_URL" -f schema.sql
```

4. Install deps and run
```bash
pnpm install
pnpm dev
```

Server listens on PORT from .env (default example 4000).

## API

- GET /api/health
  - Returns { ok: true }

- POST /api/upload-pdf (multipart/form-data)
  - Body: a single PDF file
  - Returns: { documentId, chunkCount }

- POST /api/chat (json)
  - Body: { prompt: string, documentId?: string, sessionId?: string, topK?: number }
  - Returns: { sessionId, answer, retrievedCount }
  - **RAG Mode** (with documentId): Retrieves relevant chunks from the document and answers based on context
  - **General Mode** (without documentId): Provides answers based on general knowledge and conversation history
  - Supports conversation memory across sessions
  - If sessionId is not provided, a new session will be created

## Notes
- Ensure your Postgres has pgvector extension. The provided compose uses ankane/pgvector.
- Embedding model: text-embedding-3-small (1536 dims); table schema matches.
- Chat model: gpt-4o-mini. You can change in src/services/embedder.ts.


