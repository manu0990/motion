'use server';

import OpenAI from "openai"
import prisma from "@/db/prisma";
import { systemInstructions } from '@/lib/instruction-prompt';
import { Message } from "@/types/llm-response";
import { generateTitle, MessageType } from "@/actions/ai/generateTitle";

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

type LLMReqType = {
  conversationId?: string;
  userId: string;
  userPrompt: string;
}

export async function getLLMResponse({ conversationId, userId, userPrompt }: LLMReqType): Promise<{
  assistantResponse: Message;
  conversationId: string;
  newTitleGenerated: boolean;
}> {
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

  await prisma.message.create({
    data: { author: 'USER', content: userPrompt, conversationId, createdAt: new Date() },
  });

  const history = await prisma.message.findMany({
    where: { conversationId, videoId: null },
    orderBy: { createdAt: "asc" },
    take: 20,
  });

  const messagesForLLM = [
    { role: "system", content: systemInstructions },
    ...history.map(m => ({ role: m.author.toLowerCase(), content: m.content })),
    { role: "user", content: userPrompt }
  ] as OpenAI.ChatCompletionMessageParam[];

  const response = await openai.chat.completions.create({
    model: process.env.GENERATIVE_LLM_MODEL || "gemini-1.5-flash-latest",
    messages: messagesForLLM,
  });
  const assistantMessageContent = response.choices[0].message.content ?? "Sorry, I encountered an issue.";

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
