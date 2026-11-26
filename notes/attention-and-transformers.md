# Attention and the transformer architecture

Large language models are based on the transformer architecture, introduced in 2017. A transformer processes a sequence of tokens and, for each position, builds a representation that takes the rest of the sequence into account. The core mechanism that makes this possible is called attention.

Self-attention lets every token look at every other token in the context and decide how much each one matters for understanding it. In the sentence "The server rejected the request because it was malformed", attention is what lets the model connect "it" with "request" rather than "server".

Mechanically, each token is projected into three vectors: a query, a key and a value. The query of one token is compared with the keys of all other tokens to produce attention weights, and those weights are used to mix the values. The result is a new representation of the token that blends in information from the tokens it attended to most.

Transformers run many attention operations in parallel (multi-head attention), so different heads can focus on different kinds of relationships, such as syntax, references or topic. These attention blocks are stacked in many layers, and each layer refines the representation produced by the previous one.

Because attention compares every token with every other token, its cost grows roughly with the square of the sequence length. This is one of the main reasons context windows are limited and why very long prompts are slower and more expensive to process.

Generative models like Claude or GPT are trained to predict the next token. At inference time, the model produces one token at a time, appends it to the sequence and repeats. Streaming APIs simply send each token to the client as soon as it is generated, instead of waiting for the full answer.

You do not need the mathematics to build applications with LLMs, but the mental model helps: the model only knows what is in its context, every token in the context can influence the output, and longer contexts cost more.
