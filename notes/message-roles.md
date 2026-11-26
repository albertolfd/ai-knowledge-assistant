# Message roles: system, user and assistant

Chat-based LLM APIs organise a conversation into messages, each with a role. The roles tell the model who said what and how much authority each piece of text has.

The system role carries the developer's instructions: the model's role, rules, tone and output format. In the Anthropic API, the system prompt is a separate top-level `system` parameter. In the OpenAI Chat Completions API, it is the first message in the list, with the role `system`. The idea is the same in both.

The user role carries the input from the person using the application, or input the application passes on their behalf, such as a question together with retrieved documents.

The assistant role carries the model's previous replies. Because the API is stateless, the application sends earlier assistant messages back as part of the history, so the model can refer to what it said before. User and assistant messages normally alternate.

Roles matter for security as well. Text from untrusted sources, such as web pages, documents or tool results, should never be placed where it could be mistaken for developer instructions. Keeping instructions in the system prompt and clearly delimiting untrusted content inside user messages makes prompt injection harder.

Tool use adds structure on top of these roles. When the model wants to call a tool, its assistant message contains a tool call block. The application then sends the result back in a user message containing a tool result block that references the call by its ID.

A useful mental model: the system prompt is the job description, the user messages are the requests, and the assistant messages are the work done so far.
