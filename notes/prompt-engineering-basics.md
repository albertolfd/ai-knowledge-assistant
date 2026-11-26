# Prompt engineering basics

Prompt engineering is the practice of writing instructions and context so that a model reliably produces the output you need. It is the cheapest lever available: changing a prompt requires no training and no infrastructure.

Be clear and specific. Describe the task, the audience, the constraints and what a good result looks like. A useful test is whether a capable colleague with no context could do the task from your prompt alone.

Zero-shot prompting gives only instructions. Few-shot prompting adds a few input and output examples. Experiments show that for simple, unambiguous tasks like sentiment classification, a capable model does just as well zero-shot. Examples make a visible difference when the output format is unusual or the task is ambiguous: a code review prompt with one example in the exact format "RISK / ISSUE / FIX" produces that structure consistently, while the zero-shot version writes free-form paragraphs. Few-shot is mostly about constraining the shape of the output.

Structure long prompts with clear sections. XML-style tags such as `<documents>`, `<instructions>` or `<example>` make it easy for the model to tell instructions apart from data, and easy for you to parse the output.

Ask the model to think before answering when the task needs reasoning. Asking for step-by-step reasoning, or giving the model room to reason before its final answer, tends to improve results on multi-step problems.

Say what to do, not only what to avoid. "Answer in plain prose paragraphs" works better than "don't use bullet points". And explain why a rule exists, so the model can generalise it correctly.

Treat prompts like code: keep them in version control, test them against a set of representative inputs, and re-run those tests after every change. A small prompt edit can fix one case and break another.
