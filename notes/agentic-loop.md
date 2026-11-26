# The agentic loop

An agent is a model that decides its own next steps, using tools in a loop until it can complete the task. The loop is simple to write, and most of the engineering goes into making it safe and predictable.

The loop works like this. Send the conversation and tool definitions to the model. If the response's stop reason is `end_turn`, the model has finished, and its text is the answer. If the stop reason is `tool_use`, execute each requested tool, append the model's response and the tool results to the conversation, and send it again. Repeat.

Every iteration adds the model's response and the tool results to the context. Long agent runs therefore become slower and more expensive with each step, and the context can eventually fill up. Concise tool results and a cap on the number of steps keep this under control.

A maximum step count is essential. Without it, a confused model can call tools indefinitely. When the limit is reached, the application should stop and report that the task could not be completed, rather than failing silently.

The system prompt shapes the agent's strategy. A research agent can be told to search the user's notes before searching the web, and to save a summary note after researching a topic. Rules like these turn a loop of tool calls into a predictable workflow.

Human-in-the-loop checkpoints matter for actions with side effects. An agent can be required to ask for confirmation before saving a file, sending a message or modifying data. When the user declines, the agent receives that decision as a tool result and adapts; passing along the user's reason helps it correct course.

Logging every step, including tool calls, inputs, results and token usage, is what makes agents debuggable. Without it, it is very hard to understand why an agent took a particular path.
