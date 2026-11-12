import {
  ChatRequest,
  Message,
  Source,
  SourcesState,
  StreamEvent,
} from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const MESSAGES_KEY = ["messages"] as const;

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export function useChat() {
  const queryClient = useQueryClient();
  const [streamingContent, setStreamingContent] = useState("");
  const [sourcesState, setSourcesState] = useState<SourcesState>({
    status: "idle",
  });
  const abortControllerRef = useRef<AbortController | null>(null);

  const { data: messages } = useQuery<Message[]>({
    queryKey: MESSAGES_KEY,
    queryFn: () => [],
    initialData: [],
    staleTime: Infinity,
  });

  function appendMessage(message: Message) {
    queryClient.setQueryData<Message[]>(MESSAGES_KEY, (prev = []) => [
      ...prev,
      message,
    ]);
  }

  async function streamAnswer(): Promise<void> {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const current = queryClient.getQueryData<Message[]>(MESSAGES_KEY) ?? [];
    const question = current.at(-1);
    if (!question || question.role !== "user") {
      throw new Error("There is no question to answer");
    }

    const body: ChatRequest = {
      message: question.content,
      history: current
        .slice(0, -1)
        .map(({ role, content }) => ({ role, content })),
    };

    setStreamingContent("");
    setSourcesState({ status: "loading" });

    let fullContent = "";
    let capturedSources: Source[] = [];

    function saveAnswer() {
      appendMessage({
        id: crypto.randomUUID(),
        role: "assistant",
        content: fullContent,
        sources: capturedSources,
        createdAt: new Date(),
      });
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
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
              capturedSources = event.sources;
              setSourcesState({ status: "ready", sources: event.sources });
              break;
            case "token":
              fullContent += event.text;
              setStreamingContent(fullContent);
              break;
            case "done":
              finished = true;
              break;
          }
        }
      }

      if (!finished) throw new Error("The response ended unexpectedly");
      saveAnswer();
    } catch (error) {
      if (isAbortError(error)) {
        if (fullContent) saveAnswer();
        else setStreamingContent("");
        return;
      }
      setStreamingContent("");
      throw error;
    } finally {
      setSourcesState((s) => (s.status === "loading" ? { status: "idle" } : s));
      if (abortControllerRef.current === controller)
        abortControllerRef.current = null;
    }
  }

  const { mutate, isPending, isError } = useMutation({
    mutationFn: streamAnswer,
  });

  function sendMessage(content: string) {
    if (isPending) return;
    appendMessage({
      id: crypto.randomUUID(),
      role: "user",
      content,
      createdAt: new Date(),
    });
    mutate();
  }

  function retry() {
    if (isPending) return;
    mutate();
  }

  function abort() {
    abortControllerRef.current?.abort();
  }

  useEffect(() => {
    return () => abortControllerRef.current?.abort();
  }, []);

  return {
    messages,
    streamingContent,
    sourcesState,
    isPending,
    isError,
    sendMessage,
    abort,
    retry,
  };
}
