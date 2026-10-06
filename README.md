# Knowledge base assistant

A retrieval service over a personal knowledge base, and a React interface on top of it. Ask a
question in natural language, get an answer grounded in your own documents — or an explicit "I
don't have anything on that" when the knowledge base doesn't cover it.

> **Status:** the retrieval API works end to end. The React frontend is in progress.

## Why this exists

I built this to learn. I wanted to understand how retrieval-augmented systems behave in practice
rather than read about them, and to get back into React after four years working mostly in Vue.

This is the second iteration. The first was a single program where I worked out the pipeline; this
one splits it into a retrieval API with a clear boundary, so a frontend can sit on top of it and
each part can change on its own.

## How it works

1. **Ingestion.** Documents are split into chunks, embedded, and stored in Postgres with
   [pgvector](https://github.com/pgvector/pgvector).
2. **Retrieval.** An incoming question is embedded and compared against the stored chunks by
   cosine distance. The closest `k` are returned.
3. **Cutoff.** Chunks whose similarity falls below a threshold are discarded.
4. **Reranking.** The survivors are reranked with [Voyage AI](https://www.voyageai.com/) before
   being passed on.
5. **Answering.** The model answers from the reranked chunks only. If nothing passed the cutoff,
   it says so instead of guessing.

## Design decisions

These are the choices that actually affect answer quality, and why they came out this way.

### Paragraph chunking

I compared chunking strategies before settling on one. Fixed-size chunks split sentences in the
middle: they retrieved acceptably but read badly once they reached the model. Paragraph-based
chunking worked better for my documents, because they are written as self-contained paragraphs —
each chunk ends up being one complete idea, which is both a good unit to embed and a good unit to
hand to a model.

The general lesson is that the right strategy depends on how the source documents are written,
not on a rule of thumb.

### A similarity threshold, applied before reranking

```sql
WHERE 1 - (embedding <=> $1) > 0.60
```

`<=>` is pgvector's cosine distance operator, so `1 - distance` is the similarity.

The threshold is what lets the system abstain. Without it, retrieval always returns its best `k`
guesses, the model always receives context, and the answer sounds confident even when nothing in
the knowledge base is relevant. Top-`k` guarantees a count, not relevance; the threshold adds
relevance.

It is applied **before** reranking, not after. The reranker returns scores on its own scale, so a
threshold calibrated for cosine similarity cannot be applied to them. Filtering first also means
the reranker is never called on results that were never going to qualify.

The `0.60` is calibrated for this embedding model and this corpus. It is not a portable number —
a different embedding model has a different score distribution and needs recalibrating.

### Top-k of 5, then rerank

Retrieval returns up to 5 chunks past the threshold. Reranking reorders those by relevance, which
a cross-encoder judges better than cosine distance does. The cost is one extra call per question,
which at this `k` is negligible.

## Roadmap

- **React frontend** — in progress. Chat interface over the retrieval API, with the retrieved
  chunks and their scores visible.
- **Self-expanding corpus.** In the first iteration, a question that retrieved nothing triggered a
  web search, and three agents in sequence drafted a document from the results, reviewed it, and
  stored it. The effect was that every unanswered question became a document the system could
  answer next time. I want to bring that back here, with the review step intact — a document
  written from a web search is exactly the kind of content you do not want to index unchecked.
