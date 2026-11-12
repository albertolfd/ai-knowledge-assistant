import { useEffect, useRef, useState, type KeyboardEvent } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  onRetry: () => void;
  onStop: () => void;
  isStreaming: boolean;
  isError: boolean;
}

export function ChatInput({
  onSend,
  onRetry,
  onStop,
  isStreaming,
  isError,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  useEffect(() => {
    if (isStreaming) return;
    const active = document.activeElement;
    if (!active || active === document.body) {
      textareaRef.current?.focus();
    }
  }, [isStreaming]);

  function handleSubmit() {
    const trimmedMessage = value.trim();
    if (!trimmedMessage || isStreaming) return;
    onSend(trimmedMessage);
    setValue("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="flex flex-col gap-2 border-t border-gray-200 p-4">
      {isError && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          <span className="text-sm">The answer could not be generated.</span>
          <button
            type="button"
            onClick={onRetry}
            className="shrink-0 rounded-md bg-red-600 px-3 py-1 text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <label className="flex-1">
          <span className="sr-only">Message</span>
          <textarea
            ref={textareaRef}
            value={value}
            disabled={isStreaming}
            rows={1}
            placeholder="Ask something..."
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="block w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
          />
        </label>
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
            aria-label="Send message"
            disabled={!value.trim()}
            onClick={handleSubmit}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-bold text-white hover:bg-blue-600 disabled:opacity-50"
          >
            Send
          </button>
        )}
      </div>
    </div>
  );
}
