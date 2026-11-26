# Generation with retrieved context

The last stage of RAG is generation: the retrieved chunks are placed in the prompt and the model writes an answer from them. How the context is presented has a visible effect on answer quality and trustworthiness.

Each chunk should be clearly delimited and labelled with its source, for example inside `<document index="1" source="chunking-strategies.md">` tags, all wrapped in a `<documents>` block. Clear boundaries help the model tell documents apart, cite them, and treat their contents as data rather than instructions.

The instructions should say how to use the documents: answer only from them, cite the source of each claim, and say explicitly when the answer is not in the documents instead of falling back on general knowledge. Without that last rule, a model will happily fill gaps with plausible but unsupported content.

When retrieval finds nothing above the threshold, the application should change the prompt accordingly, or tell the user directly that their notes contain nothing relevant. Showing an empty sources panel next to a confident answer would be misleading.

A low temperature suits grounded answers, since the goal is accuracy rather than variety. The thoroughness of answers depends on both the context and the prompt: smaller models in particular tend to answer briefly unless they are asked to cover every relevant detail.

In a chat interface, the conversation history is sent along with the new question so follow-up questions work. Retrieval is usually performed on the latest question only, which can fail for follow-ups like "and how do I renew it?". Rewriting the follow-up into a standalone question before retrieval is a common improvement.

Streaming the answer token by token makes the application feel responsive. Sending the sources before the first token lets the interface show what the answer is based on while it is still being written.
