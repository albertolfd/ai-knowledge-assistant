"use client";

import { MessageList } from "@/components/MessageList";
import { SourcePanel } from "@/components/SourcePanel";
import { ChatInput } from "@/components/ChatInput";
import { useChat } from "@/hooks/useChat";
import { useId, useState } from "react";

export function ChatWindow() {
  const {
    messages,
    streamingContent,
    isPending,
    isError,
    sourcesState,
    sendMessage,
    abort,
    retry,
  } = useChat();

  const [showSourcesOnMobile, setShowSourcesOnMobile] = useState(false);
  const sourcesRegionId = useId();
  const sourcesHeadingId = useId();

  function handleOpenSourcePanelMobile() {
    setShowSourcesOnMobile(!showSourcesOnMobile);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 px-4 py-2 md:hidden">
        <button
          type="button"
          aria-expanded={showSourcesOnMobile}
          aria-controls={sourcesRegionId}
          onClick={handleOpenSourcePanelMobile}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          {showSourcesOnMobile ? "Back to chat" : "Show sources"}
        </button>
      </div>

      <div className="flex min-h-0 flex-1">
        <main
          className={`${showSourcesOnMobile ? "hidden" : "flex"} min-w-0 flex-1 flex-col md:flex md:w-2/3`}
        >
          <MessageList
            messages={messages}
            streamingContent={streamingContent}
            isPending={isPending}
          />
          <ChatInput
            isStreaming={isPending}
            isError={isError}
            onSend={sendMessage}
            onStop={abort}
            onRetry={retry}
          />
        </main>

        <aside
          id={sourcesRegionId}
          aria-labelledby={sourcesHeadingId}
          tabIndex={0}
          className={`${showSourcesOnMobile ? "block" : "hidden"} relative w-full shrink-0 overflow-y-auto border-l border-gray-200 bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:block md:w-1/3`}
        >
          <SourcePanel
            sourcesState={sourcesState}
            headingId={sourcesHeadingId}
          />
        </aside>
      </div>
    </div>
  );
}
