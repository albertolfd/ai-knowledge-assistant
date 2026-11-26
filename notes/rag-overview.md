# Retrieval-Augmented Generation (RAG): overview

Retrieval-Augmented Generation is a pattern for answering questions with information the model was not trained on. Instead of relying on the model's memory, the application retrieves relevant pieces of text from its own data and puts them in the prompt, and the model answers based on them.

RAG solves several problems at once. Models have a knowledge cutoff and know nothing about private data such as internal documentation or personal notes. Grounding answers in retrieved text reduces hallucinations, and because the application knows which documents were used, it can show sources so users can check the answer.

A RAG system has two phases. Ingestion happens ahead of time: documents are split into chunks, each chunk is converted into an embedding vector, and the vectors are stored in a vector store together with the original text and metadata such as the file name.

The query phase happens for every question. The question is embedded with the same model, the vector store returns the chunks whose embeddings are closest to it, optionally a reranker reorders them by relevance, and the best chunks are inserted into the prompt for the model to answer from.

Each stage has design decisions that affect answer quality: how documents are chunked, which embedding model is used, how many chunks are retrieved, whether a similarity threshold filters weak matches, whether results are reranked, and how the retrieved text is presented in the prompt.

A RAG pipeline with fixed steps (embed, retrieve, generate) is a workflow, not an agent: the developer decides the steps. Agentic RAG lets the model decide when to search, what to search for and whether to search again.

The quality ceiling of any RAG system is the quality of its documents. If the answer is not in the corpus, or is written with completely different vocabulary than users ask with, no retrieval technique will fully compensate.
