"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChatInput } from "@/components/chat/chat-input";
import { LoadingBubble } from "./loading-bubble";
import { RateLimitAlert } from "@/components/rate-limit-alert";
import { toast } from "sonner";
import { ChatMessage } from "./chat-message";
import { ModelType } from "@/components/model-selector";
import axios from "axios";
import { mutate } from "swr";
import { useUsageStats } from "@/context/UsageStatsProvider";

const examplePrompts = [
  {
    title: "Physics Simulation",
    prompt: "Create a pendulum animation showing the relationship between potential and kinetic energy"
  },
  {
    title: "Chemistry Visualization",
    prompt: "Animate the process of photosynthesis showing light reactions and Calvin cycle"
  },
  {
    title: "Biology Animation",
    prompt: "Show how DNA replication works with helicase unwinding the double helix"
  },
  {
    title: "Mathematics Concept",
    prompt: "Visualize the Fourier transform converting a time domain signal to frequency domain"
  }
];

export function NewChatWelcome() {
  const router = useRouter();
  const { data: session } = useSession();
  const { updateStatsFromResponse } = useUsageStats();
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userMessage, setUserMessage] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [modelType, setModelType] = useState<ModelType>("fast");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = useCallback(async (prompt: string) => {
    if (!prompt.trim() || !session?.user || isLoading) return;
    setUserMessage(prompt);
    setShowWelcome(false);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await axios.post('/api/chat', {
        userPrompt: prompt,
        conversationId: "",
        modelType,
      });
      const { conversationId } = response.data;
      
      // Update usage stats from response headers
      updateStatsFromResponse(response);
      // Invalidate the conversations cache to update the sidebar
      mutate("/api/conversations");
      router.push(`/chat/${conversationId}`);
    } catch (error: unknown) {
      console.error("Error creating conversation:", error);

      if (axios.isAxiosError(error) && error.response?.status === 429) {
        const errorData = error.response?.data;
        if (errorData?.type === 'RATE_LIMIT_EXCEEDED') {
          toast.error(errorData.error || "Rate limit exceeded. Please try again later.");
        } else {
          toast.error("Too many requests. Please try again later.");
        }
      } else {
        toast.error("Failed to start conversation. Please try again.");
      }

      setUserMessage(null);
      setShowWelcome(true);
      setInputValue(prompt);
      setIsLoading(false);
    }
  }, [session?.user, router, isLoading, modelType, updateStatsFromResponse]);

  useEffect(() => {
    if (userMessage) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [userMessage]);

  if (!session?.user) return null;

  if (!showWelcome && userMessage) {
    return (
      <div className="container mx-auto h-[calc(100vh-3.5rem)] w-full flex flex-col justify-between gap-1 pb-1">
        <div className="flex flex-1 flex-col rounded-md bg-card">
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            <RateLimitAlert />
            <ChatMessage message={{ id: Date.now().toString(), role: "user", timestamp: new Date(), content: userMessage }} />
            {isLoading && <LoadingBubble />}
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
              <p className="text-xs text-muted-foreground">{example.prompt}</p>
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

