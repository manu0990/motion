"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChatInput } from "@/components/chat/chat-input";
import { UnifiedMessage } from "./unified-message";
import { LoadingBubble } from "./loading-bubble";
import { useConversation } from "@/hooks/use-conversation"; 

export function ChatInterface() {
  const params = useParams();
  const convoIdFromUrl = (params.conversationId as string) || null;
  const { data: session } = useSession();

  const {
    messages,
    isLoading,
    isSendingMessage,
    loadingMessageId,
    handleSendMessage,
    handleApproveCode,
    handleRejectCode,
  } = useConversation(convoIdFromUrl);

  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (messages.length || isSendingMessage) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    inputRef.current?.focus();
  }, [messages, isSendingMessage]);

  const handleSubmit = useCallback((prompt: string) => {
    handleSendMessage(prompt);
    setInputValue("");
  }, [handleSendMessage]);

  // Early returns after all hooks are called
  if (!session?.user) return null;

  if (!convoIdFromUrl) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground">No conversation selected</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingBubble />
      </div>
    );
  }

  return (
    <div className="container mx-auto h-[calc(100vh-3.5rem)] w-full flex flex-col justify-between gap-1 pb-1">
      <div className="flex flex-1 flex-col rounded-md bg-card">
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {messages.map((message) => (
            <UnifiedMessage
              key={message.id}
              message={message}
              onApprove={handleApproveCode}
              onReject={handleRejectCode}
              isLoading={loadingMessageId === message.id}
            />
          ))}
          {isSendingMessage && <LoadingBubble />}
          <div ref={messagesEndRef} />
        </div>
        <div className="sticky bottom-0 flex flex-col gap-2 p-2 bg-background">
          <div className="p-2 bg-accent rounded-[25px]">
            <ChatInput
              ref={inputRef}
              value={inputValue}
              onChange={setInputValue} 
              onSubmit={handleSubmit} 
              isLoading={isSendingMessage}
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