# Semantic similarity and cosine distance

Semantic similarity means comparing texts by meaning rather than by shared words. With embeddings, it becomes a geometric question: how close are two vectors?

Cosine similarity measures the angle between two vectors, ignoring their length. It is the dot product of the two vectors divided by the product of their lengths. The result ranges from -1 (opposite directions) through 0 (unrelated) to 1 (same direction). For text embeddings, values usually fall between 0 and 1.

Cosine distance is simply one minus cosine similarity, so smaller distances mean more similar texts. In pgvector, the `<=>` operator returns cosine distance, which is why queries often compute `1 - (embedding <=> query)` to get a similarity score that is easier to read and to compare against a threshold.

Many embedding models return normalised vectors, with a length of 1. For normalised vectors, cosine similarity and the dot product give the same ranking, so the inner product operator can be used and is slightly cheaper to compute.

Similarity scores are relative, not absolute. A score of 0.7 can mean a strong match with one model and a mediocre one with another, so thresholds have to be tuned on real queries against real data. Looking at the scores of good and bad results for a handful of questions is the fastest way to find a sensible threshold.

Pure vector similarity has known weaknesses. Short, dense texts that mention a topic can score higher than longer texts that explain it. Exact identifiers such as error codes, command names or product codes may not be matched reliably. Hybrid search, which combines vector similarity with keyword search, and reranking are the usual answers to these problems.
