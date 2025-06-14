import { cn } from "@/lib/utils";
import { Message } from "@/types/llm-response";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "mb-4 flex",
        message.role === "user" ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[75%] rounded-3xl",
          message.role === "user"
            ? "bg-secondary text-secondary-foreground px-5 py-2.5"
            : "bg-transparent text-secondary-foreground"
        )}
      >
        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
      </div>
    </div>
  );
}