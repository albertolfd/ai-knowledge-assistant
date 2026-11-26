# Project log: building the chat interface

This note records decisions and measurements from building the chat interface of this knowledge assistant with Next.js, React and TanStack Query. It describes this specific project rather than general concepts.

Answers are streamed from a Next.js route handler as server-sent events in a fixed order: one event with the sources, then one event per token, then a done event. Sending the sources first lets the sources panel fill in before the answer starts appearing.

An early version of the client parsed each network chunk line by line. Network chunks do not respect event boundaries, so events split across two chunks were silently dropped. The fix was to keep a buffer and only parse complete events. A TextDecoder in streaming mode also keeps multi-byte characters intact when they are split across chunks.

The React DevTools Profiler showed two unnecessary re-renders while tokens streamed. The chat input re-rendered on every token because the chat hook was not being optimised by the React Compiler: the hook contained a try/finally block, which the compiler did not support yet. Moving the network code into a separate client module fixed it.

Completed messages also re-rendered on every token, even though the list of messages kept the same reference. Wrapping the message component in React.memo fixed it, so only the message currently streaming renders on each token.

After these fixes, a typical token update took about 3.4 milliseconds in development mode, and the most expensive update, sending a message, took about 6.7 milliseconds, measured with a conversation of 32 messages. Both are well under the 16 millisecond frame budget, so the message list was not virtualised. The cost per token depends on the length of the answer being streamed, not on the number of messages.

Two layout lessons came up along the way. Screen-reader-only text is absolutely positioned, and without a positioned scroll container it escaped the layout and made the page scroll. Element ids generated with random UUIDs during rendering caused hydration mismatches; React's useId hook fixed them.
