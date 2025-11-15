-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- documents table
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- chunks table with pgvector embedding
-- text-embedding-3-small has 1536 dimensions
CREATE TABLE IF NOT EXISTS chunks (
  id BIGSERIAL PRIMARY KEY,
  document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(1536) NOT NULL
);

-- index for ANN search using ivfflat
CREATE INDEX IF NOT EXISTS idx_chunks_embedding_ivfflat ON chunks USING ivfflat (embedding);
CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON chunks(document_id);

-- Sessions for conversational memory
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Interactions linked to a session (short-term memory)
CREATE TABLE IF NOT EXISTS interactions (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_interactions_session_created ON interactions(session_id, created_at DESC);

-- Embedding cache to avoid recomputing identical embeddings
CREATE TABLE IF NOT EXISTS embedding_cache (
  id BIGSERIAL PRIMARY KEY,
  text_hash TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  embedding vector(1536) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_embedding_cache_hash ON embedding_cache(text_hash);
