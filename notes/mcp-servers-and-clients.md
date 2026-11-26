# MCP servers and clients

An MCP server is a program that exposes capabilities through the Model Context Protocol. It can wrap almost anything: a database, an internal API, the local file system, a search engine, or a personal notes index. Official SDKs exist for TypeScript, Python and other languages.

A minimal server registers its tools, each with a name, a description and an input schema, and handles the requests to call them. For example, a notes server could expose `query_notes` to search a vector index and `save_note` to write a new Markdown file and index it.

An MCP client lives inside the host application and maintains a connection to one server. A host that uses several servers runs several clients, one per server. The client discovers what the server offers, passes tool definitions to the model, forwards the model's tool calls to the server and returns the results.

The host is responsible for the user experience and for safety: deciding which servers to connect to, showing the user what a tool is about to do, and asking for confirmation before actions with side effects.

The practical benefit for developers is reuse. A notes search tool built as an MCP server works in Claude Desktop, in coding tools that support MCP, and in your own application, without any changes. The same tool built only as a function inside one application works only there.

Security deserves attention on both sides. Servers should validate input and expose only what is necessary. Hosts should treat tool results as untrusted content, since a server, or the data it returns, can contain prompt injection. Connecting to a third-party server means trusting it with whatever data it can access.

A good way to start is to build a small local server, connect it to a desktop host, and check that the model calls its tools without any model-specific integration code.
