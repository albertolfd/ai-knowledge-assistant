# Chunking strategies

Chunking is how documents are split into the pieces that get embedded and retrieved. It is one of the decisions with the biggest impact on RAG quality, because a chunk is the unit of meaning the embedding model sees and the unit of context the generation model receives.

Fixed-size chunking splits text every N characters or tokens, usually with some overlap between consecutive chunks. It is simple and fast, but it ignores structure and regularly cuts sentences and ideas in half, which produces chunks that embed poorly.

Sentence-based chunking splits on sentence boundaries and groups sentences up to a maximum size. Single sentences are usually too small to carry enough context, so grouping matters. It works well for prose but less well for notes made of headings, lists and code.

Paragraph-based chunking splits on blank lines. Markdown notes are naturally written in paragraphs, so each chunk tends to be one complete idea. Very long paragraphs can still be split with a fixed-size fallback, and very short fragments such as lone headings can be dropped.

Markdown-aware chunking splits on headings and keeps each heading attached to its content. The heading gives the chunk context, which helps both retrieval and the model reading it. It works best when documents have consistent, descriptive headings.

Semantic chunking embeds sentences and starts a new chunk where the meaning shifts. It can produce the most coherent chunks, but it is slower and more expensive because it needs embeddings during chunking.

There is a tension in chunk size. Small chunks match questions precisely but carry little context, so answers can feel thin. Large chunks carry more context but match less precisely. A common solution is small-to-big retrieval: search with small chunks, then give the model each match together with its neighbouring chunks.

One practical pitfall: splitting on blank lines must handle both Unix line endings (\n) and Windows line endings (\r\n). Normalising line endings before splitting avoids silently treating whole files as one chunk.
