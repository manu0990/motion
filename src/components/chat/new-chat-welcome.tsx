"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChatInput } from "@/components/chat/chat-input";
import { RateLimitAlert } from "@/components/rate-limit-alert";
import { toast } from "sonner";
import { UnifiedMessage } from "./unified-message";
import { ModelType } from "@/components/model-selector";
import { mutate } from "swr";
import { Message } from "@/types/llm-response";

const examplePrompts = [
  {
    title: "Pythagorean Theorem",
    prompt: "Draw a right triangle with sides a, b, and c. Add proportional squares on each side. Animate triangle → square on a → square on b → square on c. Then transform the two smaller squares into the large one."
  },
  {
    title: "Vector Addition",
    prompt: "Draw (x, y) axis then draw vectors A (blue) and B (green) from origin. Move B so its tail is at A’s head. Draw resultant C (red) from origin to B’s head. Label all vectors."
  },
  {
    title: "Stack Data Structure",
    prompt: "Draw a vertical stack of rectangles. Push blocks 1, 2, 3 on top one by one, then pop them off one by one until empty. Label 'Stack'."
  },
  {
    title: "Simple Circular Orbit",
    prompt: "Draw a large yellow circle (star) at center and a smaller blue circle (planet) orbiting it in a visible circular path at constant speed."
  }
];

export function NewChatWelcome() {
  const router = useRouter();
  const { data: session } = useSession();
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [modelType, setModelType] = useState<ModelType>("fast");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = useCallback(async (prompt: string) => {
    if (!prompt.trim() || !session?.user || isLoading) return;
    
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: prompt,
      timestamp: new Date(),
    };

    setMessages([userMessage]);
    setShowWelcome(false);
    setInputValue("");
    setIsLoading(true);

    // Create placeholder assistant message for streaming
    const assistantMessageId = crypto.randomUUID();
    const streamingMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages(prev => [...prev, streamingMessage]);

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userPrompt: prompt,
          modelType,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      let conversationId = '';
      let newTitleGenerated = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'metadata') {
                conversationId = data.conversationId;
              } else if (data.type === 'content') {
                // Update streaming message content
                setMessages(prev => 
                  prev.map(msg =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: msg.content + data.content }
                      : msg
                  )
                );
              } else if (data.type === 'complete') {
                // Finalize the message and navigate
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === assistantMessageId
                      ? { 
                          ...msg, 
                          id: data.messageId,
                          timestamp: new Date(data.timestamp),
                          isStreaming: false 
                        }
                      : msg
                  )
                );
                newTitleGenerated = data.newTitleGenerated;
              } else if (data.type === 'error') {
                throw new Error(data.error);
              }
            } catch (parseError) {
              console.error('Error parsing stream data:', parseError);
            }
          }
        }
      }

      // Invalidate the conversations cache to update the sidebar
      if (newTitleGenerated) {
        mutate("/api/conversations");
      }
      
      // Navigate to the conversation
      if (conversationId) {
        router.push(`/chat/${conversationId}`);
      }
    } catch (error: unknown) {
      console.error("Error creating conversation:", error);

      if (error instanceof Error && error.message.includes("429")) {
        toast.error("Rate limit exceeded. Please try again later.");
      } else {
        toast.error("Failed to start conversation. Please try again.");
      }

      setMessages([]);
      setShowWelcome(true);
      setInputValue(prompt);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user, router, isLoading, modelType]);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!session?.user) return null;

  if (!showWelcome && messages.length > 0) {
    return (
      <div className="container mx-auto h-[calc(100vh-3.5rem)] w-full flex flex-col justify-between gap-1 pb-1">
        <div className="flex flex-1 flex-col rounded-md bg-card">
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            <RateLimitAlert />
            {messages.map((message) => (
              <UnifiedMessage
                key={message.id}
                message={message}
                onApprove={() => {}}
                onReject={() => {}}
                isLoading={false}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="sticky bottom-0 flex flex-col gap-2 p-2 bg-background">
            <div className="p-2 bg-accent rounded-[25px]">
              <ChatInput
                ref={inputRef}
                value={inputValue}
                onChange={setInputValue}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                onModelChange={setModelType}
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

  return (
    <div className="container mx-auto py-3 h-[calc(100vh-3.5rem)] w-full flex flex-col lg:justify-center justify-between items-center gap-8">
      <div className="h-0 w-full lg:hidden" />

      <main className="flex flex-col justify-center items-center gap-8">
        <div className="w-full max-w-4xl">
          <RateLimitAlert />
        </div>

        <div className="text-center space-y-4 max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight text-primary">
            Let&apos;s bring math to motion!
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl w-full">
          {examplePrompts.map((example, index) => (
            <button
              key={index}
              onClick={() => {
                setInputValue(example.prompt);
                inputRef.current?.focus();
              }}
              className="p-4 text-left border rounded-lg hover:bg-accent transition-colors"
              disabled={isLoading}
            >
              <h3 className="font-semibold text-sm mb-2">{example.title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 overflow-hidden">{example.prompt}</p>
            </button>
          ))}
        </div>
      </main>

      <div className="w-full">
        <div className="p-2 bg-accent rounded-[25px]">
          <ChatInput
            ref={inputRef}
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            onModelChange={setModelType}
            placeholder="Describe the scientific concept you want to visualize..."
          />
        </div>
      </div>
    </div>
  );
}

