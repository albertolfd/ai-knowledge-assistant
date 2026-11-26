# Sampling strategies

Sampling is the step where the model turns its probability distribution over the vocabulary into an actual next token. Besides temperature, two other parameters are commonly available: top-k and top-p.

Greedy decoding always picks the single most likely token. It is deterministic in principle, but it tends to produce repetitive, flat text for open-ended generation, because the most likely next token is often the most generic one.

Top-k sampling keeps only the k most likely tokens and samples among them. With k set to 40, for example, the model can only choose from its 40 best candidates. This removes the long tail of very unlikely tokens, but a fixed k is crude: sometimes only two tokens are reasonable, and sometimes hundreds are.

Top-p sampling, also called nucleus sampling, keeps the smallest set of tokens whose combined probability reaches p, for example 0.9. When the model is confident, that set is small; when it is uncertain, the set grows. This adapts to the situation better than a fixed k.

These parameters interact with temperature, which is applied to the distribution first. Combining several of them makes the behaviour hard to predict. In practice, most applications only adjust temperature and leave top-k and top-p at their defaults.

For applications built on retrieval or structured output, the default advice is simple: low temperature, default sampling settings, and spend the effort on better prompts and better context instead.
