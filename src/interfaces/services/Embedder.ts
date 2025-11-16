export interface Embedder {
  // Returns an embedding vector for a single text
  embed(text: string): Promise<number[]>;
  // Same as embed but allows cache usage when available
  embedCached(text: string): Promise<number[]>;
  // Get an assistant completion given a prompt and optional system message
  getCompletion(prompt: string, systemMessage?: string): Promise<string>;
}

export default Embedder;

