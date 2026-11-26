import fs from "node:fs/promises";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { Pool } from "pg";
import { VoyageAIClient } from "voyageai";
import { chunkEmbeddingInput } from "../src/lib/embedding";
import { setupDatabase } from "./setup-db";
import { DEFAULT_BATCH_SIZE, embedAll } from "./embed";
import { chunkParagraphs } from "./chunking";

loadEnvConfig(process.cwd());

const NOTES_DIR = process.argv[2] ?? "./notes";

interface Chunk {
  filename: string;
  chunkIdx: number;
  content: string;
}

async function readChunks(
  dir: string
): Promise<{ files: string[]; chunks: Chunk[] }> {
  const files = (await fs.readdir(dir))
    .filter((file) => file.endsWith(".md"))
    .sort();
  const chunks: Chunk[] = [];

  for (const filename of files) {
    const text = await fs.readFile(path.join(dir, filename), "utf-8");
    const contents = chunkParagraphs(text);
    contents.forEach((content, chunkIdx) =>
      chunks.push({ filename, chunkIdx, content })
    );
    console.log(`${filename}: ${contents.length} chunks`);
  }

  return { files, chunks };
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  if (!process.env.VOYAGE_API_KEY) throw new Error("VOYAGE_API_KEY is not set");

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const voyage = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY });

  try {
    await setupDatabase(pool);

    const { files, chunks } = await readChunks(NOTES_DIR);
    if (chunks.length === 0) {
      console.log(`No chunks found in ${NOTES_DIR}.`);
      return;
    }

    console.log(`\nEmbedding ${chunks.length} chunks…`);
    const embeddings = await embedAll(
      voyage,
      chunks.map((chunk) => chunkEmbeddingInput(chunk.filename, chunk.content)),
      {
        batchSize: Number(process.env.VOYAGE_BATCH_SIZE ?? DEFAULT_BATCH_SIZE),
        delayMs: Number(process.env.VOYAGE_BATCH_DELAY_MS ?? 0),
      }
    );

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("DELETE FROM chunks");
      for (let i = 0; i < chunks.length; i++) {
        await client.query(
          `INSERT INTO chunks (filename, chunk_idx, content, embedding)
           VALUES ($1, $2, $3, $4)`,
          [
            chunks[i].filename,
            chunks[i].chunkIdx,
            chunks[i].content,
            JSON.stringify(embeddings[i]),
          ]
        );
      }
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

    console.log(`\nStored ${chunks.length} chunks from ${files.length} files.`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
