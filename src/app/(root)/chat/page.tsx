
"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { User, ChevronDown } from "lucide-react";
import Image from "next/image";
import { EnhancedChatInput } from "@/components/chat/enhanced-chat-input";
import { CodeEditor } from "@/components/chat/code-editor";
import { SimpleVideoDisplay } from "@/components/chat/simple-video-display";
import { getLLMResponse } from "@/actions/ai/getLLMResponse";
import { useConversation } from "@/hooks/use-conversation";
import { parseStringIntoBlocks } from "@/lib/stringParser";
import { toast } from "sonner";

type AppState = "landing" | "generating" | "generated" | "results";

export default function Chat() {
  const { data: session } = useSession();
  const [appState, setAppState] = useState<AppState>("landing");
  const [inputValue, setInputValue] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [currentCode, setCurrentCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedVideoId, setGeneratedVideoId] = useState<string | null>(null);

  // Use conversation hook only when we have a conversation ID
  const {
    messages,
    handleSendMessage,
    handleApproveCode,
    isSendingMessage,
    loadingMessageId,
  } = useConversation(currentConversationId);

  // Extract code from the latest assistant message
  useEffect(() => {
    if (messages && messages.length > 0) {
      const latestAssistantMessage = messages
        .filter(m => m.role === "assistant")
        .pop();

      if (latestAssistantMessage) {
        const contentBlocks = parseStringIntoBlocks(latestAssistantMessage.content);
        const codeBlock = contentBlocks.find(block => block.type === "code");

        if (codeBlock) {
          setCurrentCode(codeBlock.content);
          setAppState("generated");
        }

        // Check if there's a video
        if (latestAssistantMessage.videoId) {
          setGeneratedVideoId(latestAssistantMessage.videoId);
        }
      }
    }
  }, [messages]);

  const handleSubmit = useCallback(async () => {
    if (!inputValue.trim() || !session?.user || isLoading) return;

    const prompt = inputValue.trim();
    setCurrentPrompt(prompt);
    setAppState("generating");
    setInputValue("");
    setIsLoading(true);

    try {
      if (currentConversationId) {
        // If we already have a conversation, send message to it
        await handleSendMessage(prompt);
      } else {
        // Create new conversation
        const { conversationId } = await getLLMResponse({
          conversationId: "",
          userId: session.user.id,
          userPrompt: prompt,
        });

        // Set the conversation ID to start using the conversation hook
        setCurrentConversationId(conversationId);
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to start conversation. Please try again.");
      // Reset state on error
      setAppState("landing");
      setInputValue(prompt);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, session?.user, isLoading, currentConversationId, handleSendMessage]);

  const handleGenerate = useCallback(async () => {
    if (!currentCode || !messages || messages.length === 0) return;

    // Find the latest assistant message with code
    const latestAssistantMessage = messages
      .filter(m => m.role === "assistant")
      .pop();

    if (latestAssistantMessage && !latestAssistantMessage.isApproved) {
      try {
        setIsLoading(true);
        await handleApproveCode(latestAssistantMessage.id, currentCode);
        toast.success("Video generation started!");
      } catch (error) {
        console.error("Error generating video:", error);
        toast.error("Failed to generate video. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  }, [currentCode, messages, handleApproveCode]);

  const handleFolderClick = () => {
    setAppState("results");
  };

  const handleNewGeneration = () => {
    setAppState("landing");
    setCurrentPrompt("");
    setGeneratedVideoId(null);
  };

  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-gmanim-dark text-white font-inter">
      {/* Header */}
      <header className="flex justify-between items-center p-6 mx-24 lg:p-8">
        <div className="flex items-center">
          {appState !== "landing" && (
            <h1 className="text-white font-spartan text-2xl lg:text-[40px] font-bold">
              Motion
            </h1>
          )}
        </div>

        {/* User Avatar */}
        <div className="w-5 h-5 lg:w-9 lg:h-9 bg-gmanim-accent rounded-full flex items-center justify-center overflow-hidden">
          {session?.user?.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name || "User"}
              width={56}
              height={56}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <User className="w-6 h-6 text-white" />
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center px-4 lg:px-8">
        {/* Landing State */}
        {appState === "landing" && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
            <h1 className="text-4xl sm:text-6xl lg:text-[80px] font-spartan font-normal leading-tight mb-8 lg:mb-16 max-w-4xl">
              Generate video with <span className="font-bold">Manim</span>
            </h1>

            <div className="w-full max-w-md lg:max-w-lg">
              <EnhancedChatInput
                value={inputValue}
                onChange={setInputValue}
                onSubmit={handleSubmit}
                isLoading={isLoading || isSendingMessage}
              />
            </div>
          </div>
        )}

        {/* Generating/Generated/Results State */}
        {(appState === "generating" ||
          appState === "generated" ||
          appState === "results") && (
          <div className="w-full max-w-7xl">
            {/* Current Task Display */}
            <div className="mb-6">
              <h2 className="text-lg font-inter text-white mb-2">
                {currentPrompt || "Generate a rotating circle"}
              </h2>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-white font-spartan text-[15px]">
                  {appState === "generating" ? "Generating ..." : "Generated"}
                </span>
                {appState === "generating" && (
                  <ChevronDown className="w-6 h-6 text-white animate-bounce" />
                )}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-gmanim-surface-light rounded-[25px] p-3 lg:p-4 mb-8 relative">
              {(appState === "generating" || appState === "generated") && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Code Editor */}
                  <CodeEditor
                    code={currentCode}
                    onGenerate={handleGenerate}
                    onCodeChange={setCurrentCode}
                  />

                  {/* Video Display */}
                  <SimpleVideoDisplay
                    videoId={generatedVideoId || undefined}
                    isGenerating={appState === "generating" || (loadingMessageId !== null)}
                    onFolderClick={handleFolderClick}
                  />
                </div>
              )}

              {appState === "results" && (
                <div className="space-y-6">
                  {/* Generate Button */}
                  <div className="flex justify-center">
                    <button
                      onClick={handleNewGeneration}
                      className="px-6 py-3 bg-gmanim-surface-light/60 rounded-md text-white font-inter text-xs font-bold hover:bg-gmanim-surface-light transition-colors"
                    >
                      Generate
                    </button>
                  </div>

                  {/* Results would go here */}
                  <div className="text-center text-gmanim-text-secondary">
                    Results will be displayed here
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Chat Input */}
            <div className="flex justify-center">
              <div className="w-full max-w-2xl mb-10">
                <EnhancedChatInput
                  value={inputValue}
                  onChange={setInputValue}
                  onSubmit={handleSubmit}
                  isLoading={isLoading || isSendingMessage}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}