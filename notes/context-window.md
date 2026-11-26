# The context window

The context window is the maximum number of tokens a model can take into account in a single request. It includes everything: the system prompt, the conversation history, any retrieved documents, tool definitions and tool results, and the tokens the model generates in its answer.

LLM APIs are stateless. The model does not remember previous requests. A chat application creates the illusion of memory by sending the entire conversation history again with every new message. This is why long conversations become slower and more expensive over time: each new request carries all previous turns.

Context windows have grown a lot, and current models support hundreds of thousands of tokens. A large window does not mean it should always be filled. More tokens mean higher cost, higher latency before the first token, and models can pay less attention to information buried in the middle of a very long context, an effect often described as "lost in the middle".

When a conversation or a set of documents does not fit, there are several strategies. Truncation drops the oldest messages. Summarization replaces older turns with a short summary. Retrieval (RAG) avoids putting everything in the context and instead selects only the most relevant pieces for each question.

The output limit is separate from the context window. The `max_tokens` parameter caps how many tokens the model may generate in one response. If an answer stops mid-sentence, the response usually reports that it ended because the token limit was reached, and the limit should be raised or the task split.

A practical habit is to think of the context window as a budget. Decide how much goes to instructions, history, retrieved documents and the answer, and design the application so that the most important information always fits.
