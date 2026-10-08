"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isStreaming: boolean;
}

export default function ChatInput({
  onSend,
  onStop,
  isStreaming,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  function handleSubmit() {
    const trimmedMessage = value.trim();
    if (!trimmedMessage || isStreaming) return;
    onSend(value);
    setValue("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="flex items-end gap-2 border-t border-gray-200 p-4">
      <label htmlFor="chat-input" className="sr-only">
        Message
      </label>
      <textarea
        id="chat-input"
        ref={textareaRef}
        value={value}
        disabled={isStreaming}
        rows={1}
        placeholder="Ask something..."
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
      />
      {isStreaming ? (
        <button
          type="button"
          aria-label="Stop generating"
          onClick={onStop}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 shadow-md transition hover:bg-red-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-300 active:scale-95"
        >
          <span className="h-5 w-5 rounded-sm bg-white"></span>
        </button>
      ) : (
        <button
          type="button"
          aria-label="Send Message"
          disabled={!value.trim()}
          onSubmit={handleSubmit}
          className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-bold text-white hover:bg-blue-600 disabled:opacity-50"
        >
          Send
        </button>
      )}
    </div>
  );
}
