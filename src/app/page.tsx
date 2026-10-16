"use client";

import { ChatInput } from "@/components/ChatInput";
import { MessageList } from "@/components/MessageList";
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
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col items-center justify-between bg-white px-16 py-32 sm:items-start dark:bg-black">
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
