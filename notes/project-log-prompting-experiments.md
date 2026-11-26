# Project log: prompting experiments with a CLI playground

Before building the knowledge assistant, the first step of this project was a small command-line playground in TypeScript for experimenting with LLM APIs. This note records what it did and what the experiments showed.

The CLI kept a conversation loop by resending the full list of messages on every request, which made the statelessness of the API very concrete. It accepted a --system flag to change the system prompt and a --model flag to switch between Claude models and an OpenAI model, printed input and output token counts after each answer, and saved every session as a JSON file. The very first request, a short greeting, used 17 input tokens and 30 output tokens.

The few-shot experiment had a surprising first result. For sentiment classification, Claude Haiku returned exactly the same labels with and without examples, and added no explanation in either case. The difference only appeared with a less standard task: a code review prompt without examples produced free-form paragraphs, while one example in a RISK / ISSUE / FIX format made every answer follow that structure. Few-shot prompting mattered for the output shape, not for accuracy.

The JSON extraction experiment, using a short review of a programming book, showed four behaviours. The model wrapped the JSON in a Markdown code fence despite being told not to. It refused a request to change the output fields. When the next message contained fake JSON, it returned the earlier book's data again, because the conversation history was still there. And for an input with nothing to extract, it invented placeholder values instead of returning nulls.

Prompt injection tests did not succeed against Claude. Direct attempts to reveal the system prompt or switch roles were refused. Indirect injections hidden inside a simulated retrieved document, which tried to change a 30-day return policy into unlimited free returns, were recognised as attacks, and the model kept answering with the real 30-day policy.

The temperature experiment confirmed the theory: the same request for a one-sentence story gave three different stories at the default temperature and three nearly identical ones at temperature 0.
