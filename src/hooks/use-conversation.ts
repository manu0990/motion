"use client";

import { useState, useCallback } from "react";
import useSWR, { mutate } from 'swr';
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Message } from "@/types/llm-response";
import { approveAndGenerateVideo } from "@/actions/server/handleApproval";
import rejectGenerateVideo from "@/actions/server/handleRejection";
import { useUsageStats } from "@/context/UsageStatsProvider";
import axios from "axios";

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export function useConversation(conversationId: string | null) {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const { updateStatsFromResponse } = useUsageStats();

  const { data: messages = [], mutate: mutateMessages, error } = useSWR<Message[]>(
    user && conversationId ? `/api/chat/${conversationId}` : null,
    fetcher,
    {
      onError: (err) => {
        console.error(err);
        if (conversationId) {
          toast.error(`Unable to load conversation ${conversationId}`);
          router.push('/chat');
        }
      }
    }
  );

  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [loadingMessageId, setLoadingMessageId] = useState<string | null>(null);

  const handleSendMessage = useCallback(async (userPrompt: string, modelType: "fast" | "think") => {
    if (!userPrompt.trim() || !user || !conversationId) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: userPrompt,
      timestamp: new Date(),
    };

    // Add user message immediately
    await mutateMessages(prev => [...(prev || []), userMessage], false);
    setIsSendingMessage(true);

    // Create placeholder assistant message for streaming
    const assistantMessageId = crypto.randomUUID();
    const streamingMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };

    await mutateMessages(prev => [...(prev || []), streamingMessage], false);

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userPrompt,
          conversationId,
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

              if (data.type === 'content') {
                // Update streaming message content
                await mutateMessages(prev => 
                  prev?.map(msg =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: msg.content + data.content }
                      : msg
                  ) || [], false
                );
              } else if (data.type === 'complete') {
                // Finalize the message
                await mutateMessages(prev =>
                  prev?.map(msg =>
                    msg.id === assistantMessageId
                      ? { 
                          ...msg, 
                          id: data.messageId,
                          timestamp: new Date(data.timestamp),
                          isStreaming: false 
                        }
                      : msg
                  ) || [], false
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

      if (newTitleGenerated) {
        mutate("/api/conversations");
      }

    } catch (error: unknown) {
      console.error("Error sending message:", error);
      
      if (error instanceof Error && error.message.includes("429")) {
        toast.error("Rate limit exceeded. Please try again later.");
      } else {
        toast.error("Failed to send message. Please try again.");
      }
      
      // Remove both user and assistant messages on error
      await mutateMessages(prev => prev?.slice(0, -2) || [], false);
    } finally {
      setIsSendingMessage(false);
    }
  }, [user, conversationId, mutateMessages]);

  const handleApproveCode = useCallback(async (messageId: string, codeContent: string) => {
    setLoadingMessageId(messageId);
    try {
      const quality = "-qm";
      const res = await approveAndGenerateVideo(messageId, codeContent, quality);

      if (res.status === 'success' && res.videoId) {
        toast.success(res.message);
        
        // Update usage stats if included in response
        if (res.usageStats) {
          updateStatsFromResponse({
            headers: {
              'x-ratelimit-token-used': res.usageStats.tokensUsed.toString(),
              'x-ratelimit-token-remaining': res.usageStats.remaining.tokens.toString(),
              'x-ratelimit-video-used': res.usageStats.videosCreated.toString(),
              'x-ratelimit-video-remaining': res.usageStats.remaining.videos.toString(),
            }
          });
        }
        
        mutateMessages(currentMessages =>
          currentMessages?.map(msg =>
            msg.id === messageId
              ? { ...msg, isApproved: true, isRejected: false, videoId: res.videoId }
              : msg
          ), false);

        mutate('/api/library');
      } else {
        throw new Error(res.message || "Failed to generate video.");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to generate video. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoadingMessageId(null);
    }
  }, [mutateMessages, updateStatsFromResponse]);

  const handleRejectCode = useCallback(async (messageId: string) => {
    setLoadingMessageId(messageId);
    try {
      const result = await rejectGenerateVideo(messageId);
      if (result.success) {
        toast.info("Code rejected. Please describe the changes you need in your next message.");
        mutateMessages(currentMessages =>
          currentMessages?.map(m =>
            m.id === messageId ? { ...m, isRejected: true, isApproved: false } : m
          ), false);
      } else {
        toast.error(result.message);
      }
    } catch (err: unknown) {
      console.error("Rejection failed:", err);
      toast.error("Rejection failed, please try again later.");
    } finally {
      setLoadingMessageId(null);
    }
  }, [mutateMessages]);

  return {
    messages,
    isLoading: !messages && !error,
    isSendingMessage,
    loadingMessageId,
    handleSendMessage,
    handleApproveCode,
    handleRejectCode,
  };
}