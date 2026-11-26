import "server-only";

import { VoyageAIClient } from "voyageai";
import { pool } from "./db";
import type { Source } from "../types";
import { EMBEDDING_MODEL, queryEmbeddingInput } from "../embedding";

const voyage = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY });

interface RetrievalResult {
  context: string;
  sources: Source[];
}

export const SIMILARITY_THRESHOLD = 0.45;
export const VECTOR_SEARCH_LIMIT = 20;
export const MIN_RERANK_SCORE = 0.6;
export const RERANK_TOP_K = 8;
const EXCERPT_LENGTH = 200;

export async function retrieveContext(
  question: string
): Promise<RetrievalResult> {
  const embedResponse = await voyage.embed({
    input: [queryEmbeddingInput(question)],
    model: EMBEDDING_MODEL,
  });
  const embedding = embedResponse.data![0].embedding!;

  const result = await pool.query(
    `SELECT id, content, filename, 1 - (embedding <=> $1) AS similarity
        FROM chunks
        WHERE 1 - (embedding <=> $1) >= $2
        ORDER BY embedding <=> $1
        LIMIT $3`,
    [JSON.stringify(embedding), SIMILARITY_THRESHOLD, VECTOR_SEARCH_LIMIT]
  );

  if (result.rows.length === 0) {
    return { context: "", sources: [] };
  }

  const rerankResponse = await voyage.rerank({
    query: question,
    documents: result.rows.map((row) => row.content),
    model: "rerank-2.5",
    topK: result.rows.length,
  });

  const reranked = rerankResponse
    .data!.map((row) => ({
      ...result.rows[row.index!],
      rerankScore: row.relevanceScore,
    }))
    .filter((chunk) => chunk.rerankScore >= MIN_RERANK_SCORE)
    .sort((a, b) => b.rerankScore - a.rerankScore)
    .slice(0, RERANK_TOP_K);

  if (reranked.length === 0) {
    return { context: "", sources: [] };
  }

  const sources: Source[] = reranked.map((row) => ({
    id: row.id,
    filename: row.filename,
    similarity: Number(row.similarity),
    rerankScore: row.rerankScore,
    excerpt:
      row.content.length > EXCERPT_LENGTH
        ? `${(row.content as string).slice(0, EXCERPT_LENGTH).trimEnd()}...`
        : row.content,
  }));

  const context = reranked
    .map(
      (row, index) =>
        `<document index="${index + 1}" source="${row.filename}">\n${row.content}\n</document>`
    )
    .join("\n\n");

  return { context, sources };
}
