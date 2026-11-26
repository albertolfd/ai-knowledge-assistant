# Project log: making ingestion runnable

This note records how the ingestion of notes into the vector database was set up so that anyone cloning the project can run it.

The database runs in Docker with the official pgvector image, defined in a docker-compose file with a named volume so data survives container restarts. The table and the vector extension are not created by an SQL file in the container's init folder. Instead, the ingestion script creates them if they do not exist. That works with any PostgreSQL database that has pgvector, including hosted ones, while an init folder only works for that Docker container and only runs once.

The schema is a single chunks table with the file name, the chunk index, the content and a 1024-dimension vector column for Voyage's voyage-code-3 embeddings. A unique constraint on file name and chunk index prevents duplicates. There is no vector index, because exact search is fast at this size; an HNSW index would be the next step for a much larger corpus.

The ingestion script embeds every chunk first and then replaces the whole index inside one database transaction. The slow network calls happen before the database is touched, and if anything fails, the previous index stays intact. Replacing everything also removes chunks of notes that were deleted or renamed.

The embedding model name and the text prefixes live in one shared module used by both ingestion and retrieval. If the two sides ever embedded text differently, search quality would degrade without any error.

The script cannot import the application's database module, because that module imports server-only, a package that throws outside Next.js. The script creates its own connection pool instead, and loads environment variables with @next/env so it reads the same .env.local file as the application.

The first run on Voyage's free tier failed with a 429 error. Two causes overlapped. A batch of 64 chunks already exceeded the free limit of 10,000 tokens per minute in a single request. And the configured delay between batches was never applied: the setting was read when the module was imported, which under CommonJS happens before the line that loads the environment file. Passing the settings from the main function fixed it, and batches of 10 with a 21-second delay stay within both free-tier limits.
