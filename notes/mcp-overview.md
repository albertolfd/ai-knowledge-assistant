# Model Context Protocol (MCP): overview

The Model Context Protocol is an open protocol, introduced by Anthropic in November 2024, that standardises how AI applications connect to external tools and data. It is often compared to USB-C: one standard connector instead of a custom integration for every combination of application and service.

Before MCP, every AI application that wanted to use, for example, GitHub, a database or a file system had to write its own integration with each of them. With MCP, a service is wrapped once in an MCP server, and any MCP-compatible application can use it.

MCP defines three roles. The host is the AI application the user interacts with, such as Claude Desktop, an IDE or your own app. Inside the host, an MCP client manages the connection to one server. The server exposes capabilities, such as tools, resources and prompts, from some underlying system.

Messages between clients and servers use JSON-RPC 2.0. When a connection starts, client and server go through an initialisation step where they agree on the protocol version and declare which capabilities each side supports.

Servers expose three main primitives. Tools are functions the model can call. Resources are data the application can read and provide as context. Prompts are reusable templates the user can select. Clients can also offer capabilities to servers, such as sampling, which lets a server ask the host's model to generate text.

MCP decouples tools from models and applications. The same server works with any host that speaks the protocol, regardless of which model the host uses. For a developer, this means writing an integration once and making it available everywhere.

MCP does not replace tool calling. Inside the host, MCP tools are presented to the model as ordinary tools. MCP standardises how those tools are discovered, described and invoked across process and network boundaries.
