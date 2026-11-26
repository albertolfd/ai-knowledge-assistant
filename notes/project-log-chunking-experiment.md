# Project log: the chunking and reranking experiments

This note gives the detailed numbers behind the retrieval decisions of this project. The scores below are similarity scores from pgvector and relevance scores from the Voyage reranker.

The first ranking problem appeared with a question about adding an SSL certificate. A short prerequisites note that only pointed to the SSL guide ranked first with a similarity of 0.757, while the most relevant chunk of the detailed SSL note scored 0.684. Several chunks of the SSL note followed below the prerequisites note.

Three fixes were applied one after another. Prefixing chunks with "Source: <file>" and questions with "Query:" brought the two closer: 0.678 for the prerequisites note and 0.670 for the SSL note. A similarity threshold removed weak matches. Finally, the Voyage reranker scored the SSL note at 0.727 and the prerequisites note at 0.676, putting the right document first.

The reranker results also showed why diversity can matter: four of the five sources came from the same SSL file, because it had been split into several chunks. Limiting the number of chunks per file was considered but not adopted.

The chunking experiment compared four strategies on three questions. For the SSL question, the top rerank scores were 0.727 for fixed-size chunks, 0.699 for sentence chunks, 0.715 for paragraph chunks and 0.746 for Markdown-heading chunks. A question about a long, single-topic process note scored highest with paragraph chunks, at 0.887. A question about user authentication scored low with every strategy, between 0.436 and 0.500.

Judged by the quality of the answers rather than the scores alone, paragraph chunking was slightly better than Markdown-heading chunking, and both were clearly better than fixed-size and sentence chunking. Paragraph chunking became the default.

The authentication question was used to test query expansion and a lower threshold of 0.3. Neither helped much: the notes described authentication in different terms than any natural phrasing of the question, which showed that retrieval quality is limited by how the documents are written.

An important caveat was discovered later: most notes had Windows line endings, so during these experiments the paragraph and Markdown strategies were not really splitting those notes by paragraph or heading. The comparison was therefore partly unfair, although paragraph chunking still performed best once the line endings were fixed.
