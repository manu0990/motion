'use server';

import OpenAI from "openai"
import prisma from "@/db/prisma";
import { systemInstructions } from '@/lib/instruction-prompt';
import { Message } from "@/types/llm-response";
import { generateTitle, MessageType } from "@/actions/ai/generateTitle";
import { ModelType } from "@/components/model-selector";
import { 
  checkTokenRateLimit, 
  incrementTokenUsage, 
  countTokens 
} from "@/lib/rate-limiting";

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

type LLMReqType = {
  conversationId?: string;
  userId: string;
  userPrompt: string;
  modelType: ModelType;
}

export async function getLLMResponse({ conversationId, userId, userPrompt, modelType }: LLMReqType): Promise<{
  assistantResponse: Message;
  conversationId: string;
  newTitleGenerated: boolean;
}> {
  const promptTokens = countTokens(userPrompt);
  const systemTokens = countTokens(systemInstructions);
  
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
    throw new Error("Conversation not found.");
  }

  const history = await prisma.message.findMany({
    where: { conversationId, videoId: null },
    orderBy: { createdAt: "asc" },
    take: 20,
  });

  const historyTokens = history.reduce((total, message) => {
    return total + countTokens(message.content);
  }, 0);

  const estimatedTotalTokens = systemTokens + historyTokens + promptTokens + (promptTokens * 2);

  const rateLimitCheck = await checkTokenRateLimit(userId, estimatedTotalTokens);
  if (!rateLimitCheck.allowed) {
    throw new Error(rateLimitCheck.message || "Rate limit exceeded");
  }

  await prisma.message.create({
    data: { author: 'USER', content: userPrompt, conversationId, createdAt: new Date() },
  });

  const messagesForLLM = [
    { role: "system", content: systemInstructions },
    ...history.map(m => ({ role: m.author.toLowerCase(), content: m.content })),
    { role: "user", content: userPrompt }
  ] as OpenAI.ChatCompletionMessageParam[];

  const model = modelType === "fast" ? process.env.GENERATIVE_FAST_LLM_MODEL! : process.env.GENERATIVE_THINK_LLM_MODEL! || "gemini-1.5-flash-latest";

  const response = await openai.chat.completions.create({
    model,
    messages: messagesForLLM,
  });
  const assistantMessageContent = response.choices[0].message.content ?? "Sorry, I encountered an issue.";

  const responseTokens = countTokens(assistantMessageContent);
  const actualTokensUsed = systemTokens + historyTokens + promptTokens + responseTokens;

  await incrementTokenUsage(userId, actualTokensUsed);

  const savedAssistantMessage = await prisma.message.create({
    data: { conversationId, author: "ASSISTANT", content: assistantMessageContent },
  });

  const assistantResponse = {
    id: savedAssistantMessage.id,
    role: "assistant" as const,
    content: assistantMessageContent,
    timestamp: savedAssistantMessage.createdAt
  };

  let newTitleGenerated = false;

  if (convo.title === "New chat") {
    const messagesForTitle: MessageType[] = [
      ...history.map(m => ({
        role: m.author.toLowerCase() as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: userPrompt },
      { role: "assistant", content: assistantMessageContent }
    ];

    const titleContext = messagesForTitle.length > 6
      ? [...messagesForTitle.slice(0, 2), ...messagesForTitle.slice(-4)]
      : messagesForTitle;

    const titleRes = await generateTitle(conversationId, titleContext);
    newTitleGenerated = titleRes?.success;
  }

  return { assistantResponse, conversationId, newTitleGenerated };
}
