"use client";

import { ChatInput } from "@/components/ChatInput";
import { MessageList } from "@/components/MessageList";
import { SourcePanel } from "@/components/SourcePanel";
import { Message, SourcesState } from "@/lib/types";

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

  const sourcesState: SourcesState = {
    status: "ready",
    sources: [
      {
        id: 1,
        filename: "chunking-strategy.md",
        excerpt:
          "Several variables play a role in determining the best chunking strategy, and these variables vary depending on the use case. Here are some key aspects to keep in mind...",
        similarity: 0.7,
        rerankScore: 4.5,
      },
      {
        id: 2,
        filename: "rag.md",
        excerpt:
          "Retrieval-augmented generation, or RAG, is a technique that uses authoritative, external data to improve the accuracy, relevancy, and usefulness of a model’s output...",
        similarity: 0.5,
        rerankScore: 3.2,
      },
    ],
  };

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans">
      <main className="flex flex-1 flex-col gap-8 bg-white p-16 md:flex-row">
        <div className="flex flex-col md:w-2/3">
          <div className="flex-1">
            <MessageList
              messages={messages}
              streamingContent="Paragraph chunking"
              isPending={true}
            />
          </div>
          <ChatInput />
        </div>

        <div className="flex md:w-1/3">
          <SourcePanel sourcesState={sourcesState} />
        </div>
      </main>
    </div>
  );
}
