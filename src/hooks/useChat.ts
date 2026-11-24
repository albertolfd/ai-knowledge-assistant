import { ChatRequest, Message, SourcesState } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { streamAnswer } from "@/lib/client/chatStream";

const MESSAGES_KEY = ["messages"] as const;

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

  const { mutate, isPending, isError } = useMutation({
    mutationFn: async () => {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const current = queryClient.getQueryData<Message[]>(MESSAGES_KEY) ?? [];
      const question = current.at(-1);
      if (!question || question.role !== "user") {
        throw new Error("There is no question to answer");
      }

      setStreamingContent("");
      setSourcesState({ status: "loading" });

      const body: ChatRequest = {
        message: question.content,
        history: current
          .slice(0, -1)
          .map(({ role, content }) => ({ role, content })),
      };

      const { content, sources } = await streamAnswer(body, controller.signal, {
        onSources: (sources) => setSourcesState({ status: "ready", sources }),
        onToken: setStreamingContent,
      });

      if (content) {
        appendMessage({
          id: crypto.randomUUID(),
          role: "assistant",
          content,
          sources,
          createdAt: new Date(),
        });
      } else {
        setStreamingContent("");
      }
    },
    onError: () => setStreamingContent(""),
    onSettled: () => {
      setSourcesState((s) => (s.status === "loading" ? { status: "idle" } : s));
      abortControllerRef.current = null;
    },
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
