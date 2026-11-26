import type { Pool } from "pg";
import { EMBEDDING_DIMENSIONS } from "../src/lib/embedding";

export async function setupDatabase(pool: Pool): Promise<void> {
  await pool.query("CREATE EXTENSION IF NOT EXISTS vector");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS chunks (
      id        SERIAL PRIMARY KEY,
      filename  TEXT NOT NULL,
      chunk_idx INTEGER NOT NULL,
      content   TEXT NOT NULL,
      embedding vector(${EMBEDDING_DIMENSIONS}) NOT NULL,
      UNIQUE (filename, chunk_idx)
    )
  `);
}
