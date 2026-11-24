import { ChatRequest, StreamEvent, Source } from "../types";

interface StreamHandlers {
  onSources: (sources: Source[]) => void;
  onToken: (contentSoFar: string) => void;
}

interface StreamResult {
  content: string;
  sources: Source[];
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export async function streamAnswer(
  body: ChatRequest,
  signal: AbortSignal,
  handlers: StreamHandlers
): Promise<StreamResult> {
  let content = "";
  let sources: Source[] = [];

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });

    if (!response.ok)
      throw new Error(`Request failed with status ${response.status}`);
    if (!response.body) throw new Error("Response has no body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let finished = false;

    while (!finished) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const rawEvents = buffer.split("\n\n");
      buffer = rawEvents.pop() ?? "";

      for (const raw of rawEvents) {
        if (!raw.startsWith("data: ")) continue;
        const event = JSON.parse(raw.slice(6)) as StreamEvent;

        switch (event.type) {
          case "sources":
            sources = event.sources;
            handlers.onSources(event.sources);
            break;
          case "token":
            content += event.text;
            handlers.onToken(content);
            break;
          case "done":
            finished = true;
            break;
        }
      }
    }

    if (!finished) throw new Error("The response ended unexpectedly");
    return { content, sources };
  } catch (error) {
    if (isAbortError(error)) return { content, sources };
    throw error;
  }
}
