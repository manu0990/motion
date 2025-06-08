import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Message } from "./chat-interface";
import { ChatMessage } from "./chat-message";
import { CodeDisplay } from "./code-display";
import { VideoPlayer } from "./video-player";

export function UnifiedMessage({
  message,
  onApprove,
  onReject,
  isLoading,
}: {
  message: Message;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isLoading: boolean;
}) {
  if (message.code) {
    return (
      <div className="my-4">
        <CodeDisplay code={message.code} language={message.language ?? "python"} />

        {message.requiresApproval && (
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
    );
  }

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
