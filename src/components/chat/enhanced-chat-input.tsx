"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface EnhancedChatInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: () => void;
  className?: string;
  isLoading?: boolean;
}

export function EnhancedChatInput({
  placeholder = "Start typing your masterpiece ...",
  value = "",
  onChange,
  onSubmit,
  className = "",
  isLoading = false,
}: EnhancedChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(62);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && onSubmit && !isLoading) {
      e.preventDefault();
      onSubmit();
    }
  };

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to calculate scrollHeight properly
      textarea.style.height = "62px";
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.max(62, Math.min(scrollHeight, 200)); // Min 62px, Max 200px
      setHeight(newHeight);
      textarea.style.height = `${newHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  // Calculate how much to translate upward based on height increase
  const translateY = height > 62 ? -(height - 62) : 0;

  return (
    <div className={`relative ${className}`}>
      <div
        ref={containerRef}
        className="relative flex items-end"
        style={{
          transform: `translateY(${translateY}px)`,
          transition: "transform 0.2s ease-out",
        }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            onChange?.(e.target.value);
            adjustHeight();
          }}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          rows={1}
          disabled={isLoading}
          className="w-full min-h-[62px] px-5 pr-16d py-5 bg-gmanim-surface/80 backdrop-blur-xl rounded-[15px] text-gmanim-text-secondary font-inter text-[15px] placeholder:text-gmanim-text-secondary border border-white/10 outline-none shadow-[0px_1px_1.3px_0px_rgba(0,0,0,0.17),0px_8px_32px_0px_rgba(0,0,0,0.3)] resize-none overflow-hidden leading-relaxed disabled:opacity-50"
          style={{
            height: `${height}px`,
          }}
        />
        <button
          onClick={onSubmit}
          disabled={isLoading || !value.trim()}
          className="absolute right-3 bottom-3 w-10 h-10 bg-gmanim-accent/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-gmanim-accent transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowRight className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
}
