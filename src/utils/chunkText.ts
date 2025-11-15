export function chunkText(text: string, size = 800, overlap = 100): string[] {
    const cleaned = text.replace(/\r/g, '').replace(/\t/g, ' ').replace(/ +/g, ' ');

    const chunks: string[] = [];
    let i = 0;
    while (i < cleaned.length) {
        const sliceEnd = Math.min(i + size, cleaned.length);
        let chunk = cleaned.slice(i, sliceEnd);
        // Try to extend backwards to nearest sentence boundary if not starting at 0
        if (i > 0) {
            const backBoundary = chunk.search(/[.!?]\s/);
            if (backBoundary > -1 && backBoundary < 120) {
                chunk = chunk.slice(backBoundary + 1).trimStart();
            }
        }
        // Forward boundary trimming
        if (sliceEnd < cleaned.length) {
            const forward = cleaned.slice(sliceEnd, sliceEnd + 200);
            const boundaryMatch = forward.match(/^[^.!?]*[.!?]/);
            if (boundaryMatch) {
                chunk += boundaryMatch[0];
            }
        }
        chunks.push(chunk.trim());
        if (sliceEnd >= cleaned.length) break;
        i += size - overlap; // advance with overlap
    }

    // Deduplicate identical chunks (sometimes boundaries create repeats)
    const unique: string[] = [];
    const seen = new Set<string>();
    for (const c of chunks) {
        if (!seen.has(c)) { seen.add(c); unique.push(c); }
    }
    return unique;
}
