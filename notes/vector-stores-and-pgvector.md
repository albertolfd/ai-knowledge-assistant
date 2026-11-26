# Vector stores and pgvector

A vector store is a database that can store embedding vectors and efficiently find the ones closest to a query vector. Alongside each vector it stores the original text and metadata, so a search returns usable content, not just numbers.

There are dedicated vector databases such as Pinecone, Qdrant, Weaviate and Chroma, and there are extensions that add vector search to general-purpose databases. pgvector is the most widely used of the latter: an extension that adds a `vector` column type and distance operators to PostgreSQL.

pgvector has a practical advantage for many applications: vectors live next to the rest of the data in the same database. You can filter with normal SQL, join with other tables, use transactions and reuse existing backups and tooling, instead of running and synchronising a separate system.

pgvector provides three distance operators. `<->` is Euclidean (L2) distance, `<=>` is cosine distance and `<#>` is negative inner product. For text embeddings, cosine distance is the usual choice. A typical query orders rows by `embedding <=> $1` and takes the first few with `LIMIT`.

Without an index, a query compares the query vector with every row. This exact search is fast enough for thousands of rows and returns the true nearest neighbours.

For large collections, pgvector offers approximate indexes, HNSW and IVFFlat. They avoid comparing against every row by searching a pre-built structure, which is much faster at hundreds of thousands or millions of vectors. The trade-offs are that results are approximate, the index takes memory and build time, and filters in the WHERE clause are applied after the index search, so a query can return fewer rows than its LIMIT.

A common way to run pgvector locally is the official `pgvector/pgvector` Docker image, which is PostgreSQL with the extension already installed. The extension still has to be enabled in each database with `CREATE EXTENSION IF NOT EXISTS vector`.
