import { cn } from "@/lib/utils";
import { Message } from "@/types/llm-response";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { markdownComponents } from './markdown-components';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "mb-4 flex",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[75%] rounded-3xl",
          isUser
            ? "bg-secondary text-secondary-foreground px-5 py-2.5"
            : "bg-transparent text-secondary-foreground"
        )}
      >
        {isUser ? (
          <div className="text-base whitespace-pre-wrap">{message.content}</div>
        ) : (
          <div className="prose dark:prose-invert max-w-none prose-zinc text-base">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}