# Structured output and JSON extraction

Many applications need the model to return data, not prose: a JSON object with a title, a summary and tags, or a classification label that code can act on. Getting this reliably takes a few deliberate steps.

The basic approach is to describe the exact shape in the prompt, for example a JSON object with given fields and types, and to say that the answer must contain only that object. This works most of the time, but not always.

A common failure is that the model wraps the JSON in a Markdown code fence, even when told not to. Calling `JSON.parse` on that text throws. Production code should strip fences defensively before parsing, rather than trusting the instruction.

Another failure is invented data. When the input contains nothing to extract, a model may fill in plausible values instead of admitting there is nothing. The fix is to specify an explicit empty result in the prompt, for example fields set to null and an empty list of tags.

Extraction should use stateless calls: one request per document, with no conversation history. If the history from previous extractions is included, the model can reuse values from an earlier document when the current one is ambiguous.

After parsing, validate the result against a schema, for example with Zod in TypeScript, and handle validation failures explicitly. Valid JSON with the wrong shape is still a bug.

Some APIs offer a dedicated structured output mode, or let you define the desired shape as a tool schema so the model returns arguments that already match it. When available, these are more reliable than prompt instructions alone. Low temperature also helps keep the output consistent.
