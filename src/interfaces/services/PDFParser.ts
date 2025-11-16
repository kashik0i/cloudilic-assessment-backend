export interface PDFParser {
  parse(buffer: Buffer): Promise<string>;
}

export default PDFParser;

