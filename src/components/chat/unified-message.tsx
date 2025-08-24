import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChatMessage } from "./chat-message";
import { CodeDisplay } from "./code-display";
import { VideoPlayer } from "./video-player";
import { Message } from "@/types/llm-response";
import { parseStringIntoBlocks } from "@/lib/stringParser";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { unifiedMessageMarkdownComponents } from './markdown-components';

type UnifiedMessageType = {
  message: Message;
  onApprove: (id: string, codeContent: string) => void;
  onReject: (id: string) => void;
  isLoading: boolean;
}

export function UnifiedMessage({ message, onApprove, onReject, isLoading }: UnifiedMessageType) {

  if (message.role !== "user") {
    const contentBlocks = parseStringIntoBlocks(message.content);
    
    return (
      <div className="my-4">
        {contentBlocks.length > 0 ? (
          contentBlocks.map((block, idx) =>
            block.type === "text" ? (
              <div key={idx} className="prose dark:prose-invert max-w-none prose-zinc text-base">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={unifiedMessageMarkdownComponents}
                >
                  {block.content}
                </ReactMarkdown>
                {message.isStreaming && idx === contentBlocks.length - 1 && (
                  <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-1"></span>
                )}
              </div>
            ) : (
              <div key={idx} className="my-4">
                <CodeDisplay
                  code={block.content}
                  language={block.language ?? "plaintext"}
                />
                
                {!message.isApproved && !message.isRejected && (
                  <div className="mt-2 flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onReject(message.id)}
                      disabled={isLoading}
                      className="hover:bg-destructive"
                    >
                      <X className="mr-1 h-4 w-4" /> Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onApprove(message.id, block.content)}
                      disabled={isLoading}
                    >
                      <Check className="mr-1 h-4 w-4" /> Generate
                    </Button>
                  </div>
                )}

                {message.isApproved && !message.isRejected && (
                  <Badge variant="secondary" className="mt-2">
                    <Check className="mr-1 h-4 w-4 text-green-500" /> Approved
                  </Badge>
                )}
                {!message.isApproved && message.isRejected && (
                  <Badge variant="secondary" className="mt-2">
                    <X className="mr-1 h-4 w-4 text-red-500" /> Cancelled
                  </Badge>
                )}
              </div>
            )
          )
        ) : (
          // fallback to raw ChatMessage if there's no markdown to parse
          <div>
            <ChatMessage message={message} />
            {message.isStreaming && (
              <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-1"></span>
            )}
          </div>
        )}

        {message.videoId && (
          <div className="mt-2 w-full max-w-2xl overflow-hidden rounded-md border">
            <VideoPlayer videoId={message.videoId} />
          </div>
        )}
      </div>
    )
  };

  return (
    <div className="my-4">
      <ChatMessage message={message} />
    </div>
  );
}
