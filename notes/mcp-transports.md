# MCP transports

The transport layer defines how MCP messages travel between a client and a server. The protocol messages are the same regardless of transport; only the channel changes.

The stdio transport runs the server as a local subprocess of the host. The client writes JSON-RPC messages to the server's standard input and reads responses from its standard output. It needs no network configuration, which makes it the simplest option for local tools such as file system access or a local notes index.

With stdio, the server runs with the permissions of the user's machine and is started and stopped by the host. A desktop host is typically configured with the command that launches the server, for example `node` with the path to the server script, plus any environment variables it needs.

The Streamable HTTP transport is used for remote servers. The client sends requests over HTTP POST, and the server can respond with a single JSON response or open a stream of server-sent events to send several messages, such as progress updates. Remote servers can be shared by many users and run independently of any client.

Earlier versions of the specification used a separate HTTP + SSE transport for remote servers. Streamable HTTP replaced it in the 2025 revisions of the spec, although some older servers and clients still support the previous transport for compatibility.

Remote servers need authentication. The MCP specification builds on OAuth for authorising clients to access remote servers, so a hosted server can verify which user is connecting and what they are allowed to do.

The choice is usually straightforward: stdio for local, single-user tools during development or on a desktop, and Streamable HTTP for servers that are hosted, shared between users or accessed by web applications.
