# Tool calling

Tool calling, also called function calling, lets a model use capabilities outside itself: searching a database, calling an API, reading a file or running a calculation. The model does not execute anything. It asks the application to run a tool, and the application decides whether and how to do it.

The flow has four steps. The application sends the request together with a list of tool definitions. The model replies with a tool call instead of a normal answer, naming the tool and providing input arguments. The application executes the tool and sends the result back. The model uses the result to continue, either answering or calling another tool.

In the Anthropic API, a response that requests a tool has the stop reason `tool_use` and contains a `tool_use` block with an `id`, a `name` and an `input` object. The application replies with a user message containing a `tool_result` block that references the same `tool_use_id`. The model can request several tools in one response.

The description of a tool is what the model uses to decide when to call it. Vague descriptions lead to wrong or missing calls. Good descriptions say what the tool does, when to use it and when not to, for example "Search the user's personal notes. Use this before searching the web."

Some tools are executed by the provider rather than the application. Anthropic's web search and web fetch tools are server-side: the application only declares them, and the search happens on Anthropic's side. Custom tools, such as searching your own notes or saving a file, are executed by your code.

Tool results go back into the context, so large results increase cost and can crowd out other information. Returning concise, relevant results is part of designing a good tool.

Errors should also be returned as tool results, marked as errors, so the model can react, for example by retrying with different input or explaining the problem to the user.
