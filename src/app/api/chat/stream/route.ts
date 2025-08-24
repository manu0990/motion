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

    // Calculate token usage for rate limiting
    const promptTokens = countTokens(userPrompt);
    const systemTokens = countTokens(systemInstructions);

    // Get or create conversation
    let conversationId = providedConversationId;
    let convo;

    if (!conversationId) {
      convo = await prisma.conversation.create({
        data: { user: { connect: { id: userId } } },
        select: { id: true, title: true }
      });
      conversationId = convo.id;
    } else {
      convo = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { id: true, title: true }
      });
    }

    if (!convo) {
      return new Response("Conversation not found", { status: 404 });
    }

    // Get conversation history
    const history = await prisma.message.findMany({
      where: { conversationId, videoId: null },
      orderBy: { createdAt: "asc" },
      take: 20,
    });

    const historyTokens = history.reduce((total, message) => {
      return total + countTokens(message.content);
    }, 0);

    const estimatedTotalTokens = systemTokens + historyTokens + promptTokens + (promptTokens * 2);

    // Check rate limits
    const rateLimitCheck = await checkTokenRateLimit(userId, estimatedTotalTokens);
    if (!rateLimitCheck.allowed) {
      return new Response(
        JSON.stringify({ error: rateLimitCheck.message || "Rate limit exceeded", type: 'RATE_LIMIT_EXCEEDED' }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    // Save user message
    await prisma.message.create({
      data: { author: 'USER', content: userPrompt, conversationId, createdAt: new Date() },
    });

    // Prepare messages for LLM
    const messagesForLLM = [
      { role: "system", content: systemInstructions },
      ...history.map(m => ({ role: m.author.toLowerCase(), content: m.content })),
      { role: "user", content: userPrompt }
    ] as OpenAI.ChatCompletionMessageParam[];

    const model = modelType === "fast"
      ? process.env.GENERATIVE_FAST_LLM_MODEL!
      : process.env.GENERATIVE_THINK_LLM_MODEL! || "gemini-1.5-flash-latest";

    // Create streaming response
    const stream = await openai.chat.completions.create({
      model,
      messages: messagesForLLM,
      stream: true,
    });

    // Set up streaming response
    const encoder = new TextEncoder();
    let fullResponse = "";

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial metadata
          const metadata = {
            type: "metadata",
            conversationId,
            messageId: crypto.randomUUID(),
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(metadata)}\n\n`));

          // Stream the LLM response
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
        "Content-Type": "text/plain; charset=utf-8",
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
