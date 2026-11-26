# Temperature

At each step of generation, a model produces a score for every token in its vocabulary. These scores are converted into a probability distribution, and the next token is chosen from it. Temperature controls how that distribution is shaped before a token is picked.

A low temperature sharpens the distribution: the most likely tokens become even more likely, and the output becomes more focused and repeatable. A high temperature flattens it: less likely tokens get a bigger chance, and the output becomes more varied and creative, but also more prone to drifting or making mistakes.

At temperature 0, the model almost always picks the most likely token, so the same prompt tends to produce nearly the same answer. Even at 0, outputs are not strictly guaranteed to be identical across calls, because of details in how inference is run, so tests should not rely on exact matches of generated text.

A simple experiment shows the effect clearly. Asking for a one-sentence story three times at the default temperature gives three different stories. At temperature 0, the three answers become almost identical.

As a guideline, use a low temperature (0 to 0.3) for tasks with a correct answer: extraction, classification, structured output and answering questions from retrieved documents. Use a higher temperature for brainstorming, creative writing or generating varied examples.

Temperature is usually the only sampling parameter worth adjusting. Providers generally recommend changing temperature or top-p, but not both at the same time, because their effects overlap and become hard to reason about.
