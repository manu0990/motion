import { forwardRef, KeyboardEvent, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, Loader2 } from "lucide-react";
import MinimalModelSelector, { ModelType } from "../model-selector";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  onModelChange: (model: ModelType) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ value, onChange, onSubmit, isLoading = false, placeholder, onModelChange }, ref) => {
    const localRef = useRef<HTMLTextAreaElement>(null);
    const combinedRef = (ref as React.RefObject<HTMLTextAreaElement>) || localRef;

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (value.trim()) {
          onSubmit(value.trim());
        }
      }
    };

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
      autoResize(e.target);
    };

    const autoResize = (textarea: HTMLTextAreaElement) => {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`; // Max ~5 lines
    };

    useEffect(() => {
      if (combinedRef.current) autoResize(combinedRef.current);
    }, [combinedRef, value]);

    return (
      <div className="relative w-full rounded-xl bg-accent px-1">
        <Textarea
          ref={combinedRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={2}
          className="pr-14 resize-none border-none bg-transparent text-sm leading-7 focus-visible:outline-none focus-visible:ring-0 shadow-none placeholder:text-base"
          disabled={isLoading}
          style={{ maxHeight: "160px", overflowY: "auto" }}
        />

        <div className="flex items-center justify-between">
          <MinimalModelSelector onModelChange={onModelChange} />

          <Button
            className="rounded-full px-1"
            size="icon"
            onClick={() => {
              if (value.trim()) {
                onSubmit(value.trim());
              }
            }}
            disabled={isLoading || !value.trim()}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    );
  }
);

ChatInput.displayName = "ChatInput";