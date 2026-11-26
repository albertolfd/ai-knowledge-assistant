# System prompts

The system prompt is a set of instructions that frames the whole conversation. It sets the model's role, the rules it should follow, the tone and the format of its answers. The user's messages then happen inside that frame.

The same question can produce very different answers depending on the system prompt. With "You are a senior TypeScript engineer. Give short, direct answers with code examples", a question about error handling gets a compact answer with code. With a generic assistant prompt, the same question gets a longer, more general explanation.

A system prompt can also restrict scope. A customer support assistant instructed to only answer questions about orders, returns and products will politely decline unrelated requests. This works well in practice, but it is not a security boundary: determined users can sometimes talk a model out of its instructions, so sensitive restrictions must also be enforced in application code.

Good system prompts are specific. Instead of "be helpful", they describe the audience, what a good answer looks like, what to do when information is missing, and the expected format. Explaining the reason behind a rule often helps the model apply it sensibly to cases the rule did not anticipate.

In retrieval applications, the system prompt usually carries the retrieved documents and the rules for using them: answer only from the documents, cite the source of each claim, and say clearly when the answer is not in the documents.

System prompts are sent with every request, so they count against the context window and the token cost each time. Long system prompts are a good candidate for prompt caching when the provider supports it.
