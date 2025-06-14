import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChatMessage } from "./chat-message";
import { CodeDisplay } from "./code-display";
import { VideoPlayer } from "./video-player";
import { Message } from "@/types/llm-response";
import { parseStringIntoBlocks } from "@/lib/stringParser";

type UnifiedMessageType = {
  message: Message;
  onApprove: (id: string) => void;
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
              <p key={idx} className="whitespace-pre-wrap">
                {block.content}
              </p>
            ) : (
              <div key={idx} className="my-4">
                <CodeDisplay
                  code={block.content}
                  language={block.language ?? "plaintext"}
                />

                {message.isApproved && (
                  <div className="mt-2 flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onReject(message.id)}
                      disabled={isLoading}
                    >
                      <X className="mr-1 h-4 w-4" /> Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onApprove(message.id)}
                      disabled={isLoading}
                    >
                      <Check className="mr-1 h-4 w-4" /> Generate Video
                    </Button>
                  </div>
                )}

                {message.isApproved === true && (
                  <Badge variant="secondary" className="mt-2">
                    <Check className="mr-1 h-4 w-4 text-green-500" /> Approved
                  </Badge>
                )}
                {message.isApproved === false && (
                  <Badge variant="secondary" className="mt-2">
                    <X className="mr-1 h-4 w-4 text-red-500" /> Cancelled
                  </Badge>
                )}
              </div>
            )
          )
        ) : (
          // fallback to raw ChatMessage if there’s no markdown to parse
          <ChatMessage message={message} />
        )}

        {message.videoUrl && (
          <div className="mt-2 w-full max-w-2xl overflow-hidden rounded-md border">
            <VideoPlayer url={message.videoUrl} />
          </div>
        )}
      </div>
    )
  };

  return (
    <div className="my-4">
      <ChatMessage message={message} />

      {message.videoUrl && (
        <div className="mt-2 w-full max-w-2xl overflow-hidden rounded-md border">
          <VideoPlayer url={message.videoUrl} />
        </div>
      )}
    </div>
  );
}

