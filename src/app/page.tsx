"use client";

import { ChatInput } from "@/components/ChatInput";
import { MessageList } from "@/components/MessageList";
import { SourceCard } from "@/components/SourceCard";
import { Message } from "@/lib/types";

export default function Home() {
  const messages: Message[] = [
    {
      id: "user message 1",
      role: "user",
      content: "What chunking strategy do you recommend?",
      createdAt: new Date("2026-10-14"),
    },
    {
      id: "assistant message 2",
      role: "assistant",
      content: "It depends on the type of file you are chunking",
      createdAt: new Date("2026-10-14"),
    },
    {
      id: "user message 2",
      role: "user",
      content: "Give me the details about all chunking strategies",
      createdAt: new Date("2026-10-14"),
    },
  ];

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 font-sans">
      <main className="flex w-full max-w-3xl flex-1 flex-col items-center justify-between bg-white px-16 py-32 sm:items-start">
        <SourceCard
          rank={1}
          source={{
            filename: "chunking-strategy.md",
            excerpt:
              "Several variables play a role in determining the best chunking strategy, and these variables vary depending on the use case. Here are some key aspects to keep in mind...",
            similarity: 0.7,
            rerankScore: 4.5,
          }}
        />
        <MessageList
          messages={messages}
          streamingContent="Paragraph chunking"
          isPending={true}
        />
        <ChatInput />
      </main>
    </div>
  );
}
