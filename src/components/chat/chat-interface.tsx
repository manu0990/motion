"use client";

import { useState, useRef, useEffect } from "react";
import { ChatInput } from "@/components/chat/chat-input";
import { generateManimCode } from "@/actions/ai/generateManimCode";
import { UnifiedMessage } from "./unified-message";

export type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  prompt: string;
  code?: string;
  language?: string;
  videoUrl?: string;
  timestamp: Date;
  requiresApproval?: boolean;
  isApproved?: boolean;
};

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    inputRef.current?.focus();
  }, [messages]);


  const handleSendMessage = async (prompt: string) => {
    if (!prompt.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      prompt,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    const history = [...messages, userMessage];
    const manimCodeResponse = await generateManimCode(history);

    if ('error' in manimCodeResponse) {
      const errorMessage: Message = {
        id: `${Date.now()}-error`,
        role: "system",
        prompt: `Error: ${manimCodeResponse.error}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
      return;
    }

    const raw = manimCodeResponse.manimCode.trim();
    const isScript = raw.startsWith("#");

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      prompt: isScript ? "" : raw,
      code: isScript ? raw : undefined,
      language: isScript ? "python" : undefined,
      requiresApproval: isScript,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const handleApproveCode = (messageId: string) => {
    setIsLoading(true);

    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, isApproved: true, requiresApproval: false } : msg
      )
    );

    setTimeout(() => {
      const videoCompleteMessage: Message = {
        id: Date.now().toString(),
        role: "system",
        prompt: "Your mathematical video has been generated! You can view it below.",
        timestamp: new Date(),
        videoUrl: "https://v3.cdnpk.net/videvo_files/video/premium/video0036/large/611_611-0119_preview.mp4",
      };

      setMessages(prev => [...prev, videoCompleteMessage]);
      setIsLoading(false);
    }, 5000);
  };

  const handleRejectCode = (messageId: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, isApproved: false, requiresApproval: false } : msg
      )
    );

    const rejectionMessage: Message = {
      id: Date.now().toString(),
      role: "system",
      prompt: "You've rejected the code. Please provide more details about what changes you'd like to make.",
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, rejectionMessage]);
  };

  console.log(messages);


  return (
    <div className="container mx-auto h-[calc(100vh-3.5rem)] w-full flex flex-col justify-between gap-1 pb-1">
      <div className="flex flex-1 flex-col rounded-md bg-card">
        <div className="flex-1 p-4 space-y-4">
          {messages.map((message) => (
            <UnifiedMessage
              key={message.id}
              message={message}
              onApprove={handleApproveCode}
              onReject={handleRejectCode}
              isLoading={isLoading}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="sticky bottom-0 flex flex-col gap-2 pb-1 bg-background">
          <div className="p-2 bg-accent rounded-[25px]">
            <ChatInput
              ref={inputRef}
              value={inputValue}
              onChange={setInputValue}
              onSubmit={handleSendMessage}
              isLoading={isLoading}
              placeholder="Describe the scientific concept you want to visualize..."
            />
          </div>
          <p className="mx-auto text-center text-xs font-normal tracking-tight leading-3 text-primary/75 whitespace-nowrap">
            Motion can make mistakes. Check before use.
          </p>
        </div>
      </div>
    </div>
  );
}