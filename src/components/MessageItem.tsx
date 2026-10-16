import { Role } from "@/lib/types";
import { Streamdown } from "streamdown";
import { code } from "@streamdown/code";

const plugins = { code };

interface MessageProps {
  content: string;
  role?: Role;
  isStreaming?: boolean;
}

export function MessageItem({
  content,
  role = "user",
  isStreaming = false,
}: MessageProps) {
  const isUser = role === "user";

  function renderAssistantMessage() {
    return isStreaming && content === "" ? (
      <TypingDots />
    ) : (
      <Streamdown plugins={plugins} caret="block" isAnimating={isStreaming} >
        {content}
      </Streamdown>
    );
  }

  function TypingDots() {
    return (
      <span aria-hidden="true" className="flex gap-1 py-1">
        <span className="h-2 w-2 rounded-full bg-gray-400 motion-safe:animate-bounce" />
        <span className="h-2 w-2 rounded-full bg-gray-400 [animation-delay:150ms] motion-safe:animate-bounce" />
        <span className="h-2 w-2 rounded-full bg-gray-400 [animation-delay:300ms] motion-safe:animate-bounce" />
      </span>
    );
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        aria-busy={isStreaming}
        className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${isUser ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"}`}
      >
        <span className="sr-only">
          {isUser ? "You said:" : "Assistant said:"}
        </span>

        {isUser ? (
          <p className="whitespace-pre-wrap">{content}</p>
        ) : (
          renderAssistantMessage()
        )}
      </div>
    </div>
  );
}
