import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { z } from "zod";
import OpenAI from "openai";
import prisma from "@/db/prisma";
import { systemInstructions } from '@/lib/instruction-prompt';
import { checkTokenRateLimit, incrementTokenUsage, countTokens } from "@/lib/rate-limiting";
import { generateTitle, MessageType } from "@/actions/ai/generateTitle";

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

const chatSchema = z.object({
  userPrompt: z.string().min(1, "Message cannot be empty").max(10000, "Message too long"),
  conversationId: z.string().optional(),
  modelType: z.enum(["fast", "think"]).default("fast"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const parseResult = chatSchema.safeParse(body);

    if (!parseResult.success) {
      return new Response(
        JSON.stringify({ error: "Invalid request data", details: parseResult.error.issues }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { userPrompt, conversationId: providedConversationId, modelType } = parseResult.data;
    const userId = session.user.id;

    // Calculate basic token usage for early rate limiting check
    const promptTokens = countTokens(userPrompt);
    const systemTokens = countTokens(systemInstructions);

    // Set up streaming response immediately
    const encoder = new TextEncoder();
    let fullResponse = "";

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial metadata immediately (streaming starts here)
          const tempMessageId = crypto.randomUUID();
          const metadata = {
            type: "metadata",
            conversationId: providedConversationId || "pending",
            messageId: tempMessageId,
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(metadata)}\n\n`));

          // Start setup operations
          let conversationId = providedConversationId;
          let convo;
          let history: any[] = [];
          let historyTokens = 0;

          // Get or create conversation and fetch history in parallel
          const [conversationResult, historyResult] = await Promise.all([
            (async () => {
              if (!conversationId) {
                const newConvo = await prisma.conversation.create({
                  data: { user: { connect: { id: userId } } },
                  select: { id: true, title: true }
                });
                return { conversationId: newConvo.id, convo: newConvo };
              } else {
                const existingConvo = await prisma.conversation.findUnique({
                  where: { id: conversationId },
                  select: { id: true, title: true }
                });
                return { conversationId, convo: existingConvo };
              }
            })(),
            providedConversationId ? prisma.message.findMany({
              where: { conversationId: providedConversationId, videoId: null },
              orderBy: { createdAt: "asc" },
              take: 20,
            }) : Promise.resolve([])
          ]);

          conversationId = conversationResult.conversationId;
          convo = conversationResult.convo;
          history = historyResult;

          if (!convo) {
            throw new Error("Conversation not found");
          }

          // Update metadata with actual conversation ID if it was created
          if (!providedConversationId) {
            const updatedMetadata = {
              type: "metadata",
              conversationId,
              messageId: tempMessageId,
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(updatedMetadata)}\n\n`));
          }

          // Calculate history tokens and do rate limit check
          historyTokens = history.reduce((total, message) => {
            return total + countTokens(message.content);
          }, 0);

          const estimatedTotalTokens = systemTokens + historyTokens + promptTokens + (promptTokens * 2);

          // Check rate limits
          const rateLimitCheck = await checkTokenRateLimit(userId, estimatedTotalTokens);
          if (!rateLimitCheck.allowed) {
            throw new Error(rateLimitCheck.message || "Rate limit exceeded");
          }

          // Prepare messages for LLM
          const messagesForLLM = [
            { role: "system", content: systemInstructions },
            ...history.map(m => ({ role: m.author.toLowerCase(), content: m.content })),
            { role: "user", content: userPrompt }
          ] as OpenAI.ChatCompletionMessageParam[];

          const model = modelType === "fast"
            ? process.env.GENERATIVE_FAST_LLM_MODEL!
            : process.env.GENERATIVE_THINK_LLM_MODEL! || "gemini-1.5-flash-latest";

          // Start LLM streaming and save user message in parallel
          const [stream] = await Promise.all([
            openai.chat.completions.create({
              model,
              messages: messagesForLLM,
              stream: true,
            }),
            prisma.message.create({
              data: { author: 'USER', content: userPrompt, conversationId, createdAt: new Date() },
            })
          ]);

          // Stream the LLM response immediately
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              fullResponse += content;
              const streamData = {
                type: "content",
                content,
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(streamData)}\n\n`));
            }
          }

          // Save assistant message to database
          const savedAssistantMessage = await prisma.message.create({
            data: {
              conversationId,
              author: "ASSISTANT",
              content: fullResponse
            },
          });

          // Calculate actual token usage and update
          const responseTokens = countTokens(fullResponse);
          const actualTokensUsed = systemTokens + historyTokens + promptTokens + responseTokens;
          await incrementTokenUsage(userId, actualTokensUsed);

          // Generate title if it's a new conversation
          let newTitleGenerated = false;
          if (convo.title === "New chat") {
            const messagesForTitle: MessageType[] = [
              ...history.map(m => ({
                role: m.author.toLowerCase() as "user" | "assistant",
                content: m.content,
              })),
              { role: "user", content: userPrompt },
              { role: "assistant", content: fullResponse }
            ];

            const titleContext = messagesForTitle.length > 6
              ? [...messagesForTitle.slice(0, 2), ...messagesForTitle.slice(-4)]
              : messagesForTitle;

            const titleRes = await generateTitle(conversationId, titleContext);
            newTitleGenerated = titleRes?.success || false;
          }

          // Send completion metadata
          const completionData = {
            type: "complete",
            messageId: savedAssistantMessage.id,
            timestamp: savedAssistantMessage.createdAt,
            newTitleGenerated,
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(completionData)}\n\n`));

          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          const errorData = {
            type: "error",
            error: error instanceof Error ? error.message : "Unknown error occurred",
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("Stream API error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
