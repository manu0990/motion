"use client";

import { useState, useRef, useEffect } from "react";
import { ChatInput } from "@/components/chat/chat-input";
import { UnifiedMessage } from "./unified-message";
import { useSession } from "next-auth/react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { getLLMResponse } from "@/actions/ai/getLLMResponse";
import { Message } from "@/types/llm-response";
import axios from "axios"

export function ChatInterface() {
  const params = useParams();
  const convoIdFromUrl = params.conversationId as string;
  const pathName = usePathname();
  const session = useSession();
  const router = useRouter();
  const user = session.data?.user;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(convoIdFromUrl || "");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // Scrolls the chat to the latest message and focuses the input whenever messages change.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    inputRef.current?.focus();
  }, [messages]);

  // Updates the internal conversation ID state if the URL parameter changes.
  useEffect(() => {
    if (convoIdFromUrl && convoIdFromUrl !== conversationId) {
      setConversationId(convoIdFromUrl);
    }
  }, [convoIdFromUrl, conversationId]);

  // Loads the chat history from the server when the user or conversation ID changes.
  useEffect(() => {
    if (user && conversationId) {
      axios.get(`/api/chat/${conversationId}`)
        .then(res => {
          if (res.statusText !== "OK") throw new Error("Failed to load chat history");
          return res.data;
        })
        .then((data: Message[]) => setMessages(data))
        .catch(err => console.error(err));
    }
  }, [conversationId, user]);

  if (!user) return;

  const handleSendMessage = async (userPrompt: string) => {
    if (!userPrompt.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: userPrompt,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    const { assistantResponse, conversationId: newConversationId } = await getLLMResponse({ conversationId, userId: user.id, userPrompt });

    setMessages(prev => [...prev, assistantResponse]);
    if (conversationId === "") {
      setConversationId(newConversationId);
      if (pathName !== `/chat/${newConversationId}`) {
        router.push(`/chat/${newConversationId}`);
      }
    }
    setIsLoading(false);
  }

  const handleApproveCode = async (messageId: string) => {
    setIsLoading(true);

    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, isApproved: true } : msg
      )
    );

    // Here I need to send another request to any other server for the video job
    setTimeout(() => { // <--- remove this

      const videoCompleteMessage: Message = {
        id: Date.now().toString(),
        role: "system",
        content: "Your video has been generated! You can view it below.",
        timestamp: new Date(),
        videoUrl: "https://res.cloudinary.com/dw118erfr/video/upload/v1740545482/samples/cld-sample-video.mp4",
      };

      setMessages(prev => [...prev, videoCompleteMessage]);
      setIsLoading(false);

    }, 15000);        // <--- remove this
  }

  const handleRejectCode = (messageId: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, isApproved: false } : msg
      )
    );

    const rejectionMessage: Message = {
      id: Date.now().toString(),
      role: "system",
      content: "You've rejected the code. Please provide more details about what changes you'd like to make.",
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, rejectionMessage]);
  };

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