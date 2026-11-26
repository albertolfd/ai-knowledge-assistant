# MCP primitives: tools, resources and prompts

MCP servers expose three kinds of primitives. The clearest way to tell them apart is to ask who decides when each one is used.

Tools are model-controlled. They are functions the model can decide to call during a conversation, such as searching notes, creating a ticket or running a query. Each tool has a name, a description and an input schema, exactly like tools defined directly in an API request. Tools can have side effects, so hosts usually let users approve calls.

Resources are application-controlled. They are pieces of data identified by a URI, such as a file, a database record or a document, that the host application can read and add to the context. The application or the user chooses which resources to include; the model does not fetch them on its own. A notes server could expose each note as a resource so a user can attach a specific note to the conversation.

Prompts are user-controlled. They are reusable templates, often with arguments, that a user selects explicitly, for example from a menu or a slash command. A notes server might offer a "summarise note" prompt that takes a file name and produces a ready-made request for the model.

The same capability can sometimes be modelled in more than one way. Reading a note could be a tool, so the model decides when to read it, or a resource, so the user or application decides. The choice depends on who should be in control.

Choosing the right primitive keeps a server easy to use. Things the model should do on its own belong in tools. Context the user wants to bring in belongs in resources. Workflows the user wants to trigger repeatedly belong in prompts.

Not every host supports every primitive. Tools are the most widely supported, so a server that relies mainly on tools works in the largest number of applications.
