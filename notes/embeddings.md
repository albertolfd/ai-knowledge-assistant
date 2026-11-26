# Embeddings

An embedding is a list of numbers, a vector, that represents the meaning of a piece of text. Embedding models are trained so that texts with similar meaning produce vectors that are close to each other, even when they use different words.

For example, "How do I renew a certificate?" and "Steps for extending an SSL certificate before it expires" share few words, but their embeddings end up close together. A keyword search would struggle to match them; a vector search finds them easily.

Embedding vectors have a fixed number of dimensions determined by the model, typically from a few hundred to a few thousand. Each dimension is not individually meaningful; meaning is spread across all of them. The database column that stores them must have the same number of dimensions as the model produces.

The same embedding model must be used for documents and for queries. Vectors from different models live in different spaces and cannot be compared. Changing the embedding model means re-embedding the entire corpus.

Questions and documents are different kinds of text, so some providers let you specify an input type, query or document, which adjusts the embedding for asymmetric search. A simpler alternative is to add a consistent prefix, such as "Query:" for questions and "Source: <filename>" for chunks, and to apply exactly the same prefixes everywhere.

Embedding models are separate from chat models. Anthropic, for example, does not offer its own embedding model and recommends Voyage AI, which has general-purpose models as well as models tuned for code and technical text.

Embedding APIs accept batches of texts in one request. Batching many chunks per request is much faster during ingestion and helps stay within rate limits, which are often expressed both in requests per minute and in tokens per minute.
