# Tokenization

Language models do not read characters or words directly. Text is first split into tokens: small units that can be whole words, parts of words, single characters or punctuation. Each token is mapped to an integer ID, and the model only ever sees sequences of these IDs.

Most modern models use subword tokenization, typically a variant of Byte Pair Encoding (BPE). Common words such as "the" or "function" usually become a single token, while rare or long words are split into several pieces, for example "tokenization" might become "token" + "ization". This keeps the vocabulary to a manageable size (tens of thousands of entries) while still being able to represent any text.

A useful rule of thumb for English is that one token is roughly four characters, or about three quarters of a word. This is only an approximation. Code, numbers, URLs and languages other than English often use noticeably more tokens for the same amount of text, because their character sequences are less common in the data the tokenizer was built from.

Tokens matter in practice for three reasons. API pricing is per token, separately for input and output. Context windows and output limits are measured in tokens, not characters. And rate limits are often expressed in tokens per minute, so a request with long documents can hit a limit even if the number of requests is small.

Different model families use different tokenizers, so the same text can produce different token counts depending on the model. When you need exact numbers, use the token counting endpoint or the usage information returned by the API rather than estimating from character counts.

Tokenization also explains some surprising model behaviour. Tasks like counting letters in a word or reversing a string are harder than they look, because the model sees a few tokens rather than individual characters.
