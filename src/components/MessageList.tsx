import { Message } from "@/lib/types";
import { MessageItem } from "./MessageItem";
import { useLayoutEffect, useRef } from "react";

const BOTTOM_THRESHOLD_PX = 80;

interface MessageListProps {
  messages: Message[];
  streamingContent: string;
  isPending: boolean;
}

export function MessageList({
  messages,
  streamingContent,
  isPending,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const istAtBottomRef = useRef(true);

  const lastRole = messages.at(-1)?.role;
  const isEmpty = messages.length === 0;
  const isAwaitingResponse = isPending && lastRole === "user";
  const isWaitingForFirstToken = isAwaitingResponse && streamingContent === "";

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    istAtBottomRef.current = distanceFromBottom < BOTTOM_THRESHOLD_PX;
  }

  function scrollToBottom() {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }

  useLayoutEffect(() => {
    if (lastRole === "user") {
      istAtBottomRef.current = true;
      scrollToBottom();
    }
  }, [messages.length, lastRole]);

  useLayoutEffect(() => {
    if (istAtBottomRef.current) scrollToBottom();
  }, [streamingContent]);

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      role="region"
      aria-label="Conversation"
      tabIndex={0}
      className="flex-1 overflow-y-auto p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {isEmpty && (
        <p className="mt-8 text-center text-sm text-gray-500">
          Ask a question about your notes to get started.
        </p>
      )}

      <div role="log" className="flex flex-col gap-3">
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            content={message.content}
            role={message.role}
          />
        ))}
      </div>

      {isAwaitingResponse && (
        <div className="mt-3">
          <MessageItem
            content={streamingContent}
            role="assistant"
            isStreaming
          />
        </div>
      )}

      <p role="status" className="sr-only">
        {isWaitingForFirstToken ? "Searching your notes..." : ""}
      </p>
    </div>
  );
}
