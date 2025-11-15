import crypto from 'crypto';
import { pool } from '../../db';
import { embedText } from './embedder';

function hashText(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

export async function getOrEmbed(text: string): Promise<number[]> {
  const h = hashText(text);
  const existing = await pool.query('SELECT embedding FROM embedding_cache WHERE text_hash = $1', [h]);
  if (existing.rows[0]) {
    // embedding stored as pgvector; fetch as float[]
    // pg returns as string like '(...)' sometimes; enforce numeric array parsing if needed
    const raw = existing.rows[0].embedding;
    if (Array.isArray(raw)) return raw as number[];
    if (typeof raw === 'string') {
      const cleaned = raw.replace(/[\[()\]]/g, '').split(',').map(v => parseFloat(v));
      return cleaned;
    }
  }
  const emb = await embedText(text);
  const embeddingVector = `[${emb.join(',')}]`;
  await pool.query('INSERT INTO embedding_cache(text_hash, content, embedding) VALUES ($1, $2, $3::vector) ON CONFLICT (text_hash) DO NOTHING', [h, text, embeddingVector]);
  return emb;
}

export async function batchGetOrEmbed(texts: string[]): Promise<number[][]> {
  const results: number[][] = [];
  for (const t of texts) {
    results.push(await getOrEmbed(t));
  }
  return results;
}

