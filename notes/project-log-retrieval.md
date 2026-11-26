# Project log: building the retrieval pipeline

This note records the decisions and measurements made while building the retrieval pipeline of this knowledge assistant. Unlike the other notes, it describes this specific project, so its contents cannot come from a model's general knowledge.

The chunking strategy was chosen with an experiment. The same notes were ingested four times, with fixed-size, sentence, paragraph and Markdown-heading chunking, and the same questions were asked against each version. Paragraph chunking gave the best answers, Markdown-heading chunking was close, and fixed-size and sentence chunking were clearly worse.

Prefixing each chunk with its file name before embedding ("Source: <file>") and each question with "Query:" reduced a ranking problem. Before the prefix, a short file that only mentioned a topic outranked the detailed file about it by 0.073 in similarity. After the prefix, the gap shrank to 0.008. Adding a reranker then put the detailed file first.

Query expansion, where the model rephrases the question before retrieval, was tried and dropped. For the question that retrieved poorly, the rephrased versions found the same chunks, because the notes described the topic with different vocabulary than any natural phrasing of the question.

The biggest single improvement came from a bug found by a unit test. Paragraph splitting looked for two consecutive newlines, but most notes had Windows line endings, where a blank line is \r\n\r\n. Those notes were never split into paragraphs. Normalising line endings before splitting changed the index from 168 chunks to 599 chunks.

With smaller chunks, answers became more precise but thinner, so the retrieval settings were retuned: 20 candidates from the vector search instead of 10, and 8 chunks kept after reranking instead of 5.

The thresholds were then tuned with a set of ten test questions, from direct and reworded questions to off-topic ones. Vector similarity turned out to be a weak signal of relevance: correct chunks scored between 0.55 and 0.83, while wrong ones reached 0.79, and the original threshold of 0.60 excluded the correct chunk for two of the ten questions. Rerank scores separated much more cleanly, with correct sources between 0.77 and 0.91 and clearly irrelevant ones at 0.59 or below.

The final design uses each score for what it is good at. The vector search uses a loose similarity threshold of 0.45 to catch everything that might be relevant, and the reranker keeps only chunks with a relevance score of at least 0.6. When nothing passes, the assistant says the notes do not cover the question instead of answering from general knowledge.

Ingestion embeds all chunks first and then replaces the whole index in one database transaction, so a failed run never leaves a half-updated index. On Voyage AI's free tier, which allows 3 requests and 10,000 tokens per minute, ingestion uses batches of 10 chunks with a 21-second delay between them.
