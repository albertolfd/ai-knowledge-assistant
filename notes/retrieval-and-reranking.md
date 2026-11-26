# Retrieval and reranking

Retrieval is the step that selects which chunks the model will see. The basic version embeds the question, runs a vector search, and takes the top k results. Several refinements make a large difference to quality.

A similarity threshold discards results below a minimum score, instead of always returning k results. Without it, a question unrelated to the corpus still retrieves the k "least bad" chunks, and the model may try to answer from irrelevant text. With it, the application can detect that nothing relevant was found and say so.

Reranking adds a second, more precise stage. A reranker, also called a cross-encoder, reads the question and a candidate chunk together and scores how well the chunk answers the question. This is more accurate than comparing two independently computed embeddings, but slower, so it is applied only to a shortlist: for example, fetch 20 candidates by vector search and keep the best 8 after reranking.

Reranking fixes a typical failure of vector search. A short file that only mentions a topic, such as a prerequisites list pointing to a detailed guide, can have a higher vector similarity than the guide itself. A reranker recognises that the guide actually explains the topic and ranks it first.

Retrieving more candidates and keeping more chunks has diminishing returns. More chunks mean longer prompts, higher cost and latency, and more irrelevant text that can distract the model. A good approach is to keep chunks above a minimum rerank score, up to a maximum number.

Query expansion asks a model to rephrase the question in several ways and retrieves for each version. It helps when users and documents describe the same idea in different words, but it cannot help when the documents use entirely different terminology.

Hybrid search combines vector similarity with keyword search, such as PostgreSQL full-text search or BM25, and merges the scores. It is especially useful for exact terms like error codes and command names. Limiting the number of chunks per file can also prevent one long document from filling all the slots.
