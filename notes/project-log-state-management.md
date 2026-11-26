# Project log: state management in the chat interface

This note records the state management decisions in the chat interface of this project, which uses React, Next.js and TanStack Query.

The conversation history is stored in the TanStack Query cache with setQueryData, read in components through useQuery. Messages are not real server state: they are created in the browser while streaming, and there is no endpoint to refetch them. TanStack is used here as a client-side store, a choice that Zustand would have served equally well.

Two query options keep that setup safe. initialData set to an empty array means the list is never undefined and the placeholder query function never runs. staleTime set to Infinity prevents automatic refetches, which would otherwise call the placeholder function and replace the whole conversation with an empty list every time the browser tab regained focus.

The text of the answer being streamed and the retrieved sources are local React state. They change on every token and only matter during one request, so putting them in the query cache would add overhead for no benefit. The completed answer is written to the cache once, when streaming ends.

The sources panel state started as an array or null, where null meant "not received yet". That made "still searching" and "searched and found nothing" hard to tell apart. It was replaced with a discriminated union with three states, idle, loading and ready with a list of sources, and an exhaustive check makes TypeScript report any state the panel forgets to handle.

Code that runs between renders, such as the async function that streams the answer, cannot rely on values captured during a render, because React closures capture the values of that render. The hook reads the current conversation from the cache with getQueryData when a request starts, which also makes retrying work: the question is always the last message in the cache.

The hook allows only one request at a time. Stopping an answer is not treated as an error: if some text has already arrived, it is saved as a message. Unmounting the chat aborts any request still running.

Each component keeps its state as close as possible to where it is used. The chat input owns the text being typed, so typing re-renders only the input, not the conversation.
