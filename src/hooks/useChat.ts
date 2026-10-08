import { ChatRequest, Message, Source } from "@/lib/types";
import { useCallback, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useChat() {
  const queryClient = useQueryClient();
  const [streamingContent, setStreamingContent] = useState("");
  const [sources, setSources] = useState<Source[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["messages"],
    queryFn: () => [],
    staleTime: Infinity,
  });

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async (userMessage: string) => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: userMessage,
        createdAt: new Date(),
      };
      queryClient.setQueryData<Message[]>(["messages"], (prev = []) => [
        ...prev,
        userMsg,
      ]);

      setStreamingContent("");
      setSources([]);

      const body: ChatRequest = {
        message: userMessage,
        history: messages,
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";
      let capturedSources: Source[] = [];

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6);

          try {
            const event = JSON.parse(raw);

            if (event.type === "sources") {
              capturedSources = event.sources;
              setSources(capturedSources);
            } else if (event.type === "token") {
              fullContent += event.text;
              setStreamingContent(fullContent);
            } else if (event.type === "done") {
              const assistantMsg: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: fullContent,
                sources: capturedSources,
                createdAt: new Date(),
              };

              queryClient.setQueryData<Message[]>(["messages"], (prev = []) => [
                ...prev,
                assistantMsg,
              ]);
              setStreamingContent("");
            }
          } catch {}
        }
      }

      return fullContent;
    },
  });

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
    setStreamingContent("");
  }, []);

  return {
    messages,
    streamingContent,
    sources,
    isPending,
    sendMessage,
    abort,
  };
}
