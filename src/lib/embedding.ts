export const EMBEDDING_MODEL = "voyage-code-3";
export const EMBEDDING_DIMENSIONS = 1024;

export function chunkEmbeddingInput(filename: string, content: string): string {
  return `Source: ${filename}\n\n${content}`;
}

export function queryEmbeddingInput(question: string): string {
  return `Query: ${question}`;
}
