import { Role } from "@/lib/types";
import { Streamdown } from "streamdown";
import { code } from "@streamdown/code";

const plugins = { code };

interface MessageProps {
  content: string;
  role?: Role;
  isStreaming?: boolean;
}

export function Message({
  content,
  role = "user",
  isStreaming = false,
}: MessageProps) {
  const isUser = role === "user";

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
          <Streamdown plugins={plugins} isAnimating={isStreaming}>
            {content}
          </Streamdown>
        )}
      </div>
    </div>
  );
}
