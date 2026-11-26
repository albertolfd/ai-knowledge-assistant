# Workflows vs agents

Systems built with LLMs fall into two broad categories. In a workflow, the developer defines the sequence of steps in code, and the model is used at specific points. In an agent, the model itself decides which steps to take, in what order and when to stop.

A basic RAG pipeline is a workflow: embed the question, retrieve chunks, generate an answer, always in that order. A research assistant that decides whether to search the notes, search the web, search again or save a note is an agent.

The distinction matters because the two have different trade-offs. Workflows are predictable, cheaper, easier to test and easier to debug. Agents are flexible and can handle open-ended tasks, but they are less predictable, can take unnecessary steps, and cost more.

Anthropic's guidance on building agents recommends starting with the simplest solution and adding complexity only when it clearly improves results. If the steps of a task are known in advance, a workflow is usually the better choice.

Common workflow patterns include prompt chaining (each call processes the output of the previous one), routing (a first call classifies the input and sends it to a specialised path), parallelisation (independent calls run at the same time and their results are combined), orchestrator-workers (a central model breaks down a task and delegates parts) and evaluator-optimiser (one call produces a result and another critiques it in a loop).

Multi-agent setups split a task between specialised sub-agents, each with its own focused prompt and tools: for example a research agent, a writer agent and a reviewer agent. When the sequence is fixed, the orchestration can be plain code, which makes the whole system a workflow with agent-like steps inside it.

In practice, most production systems are exactly that: workflows with agentic components at specific decision points. The overall structure stays predictable, while individual steps get the flexibility they need.
