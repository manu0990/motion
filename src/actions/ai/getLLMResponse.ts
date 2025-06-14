'use server';

import OpenAI from "openai"
import prisma from "@/db/prisma";
import { systemInstructions } from '@/lib/instruction-prompt';
import { Message } from "@/types/llm-response";

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
}> {
  if (!conversationId) {
    const conversation = await prisma.conversation.create({
      data: {
        user: {
          connect: { id: userId }
        }
      }
    });

    conversationId = conversation.id;
  };

  await prisma.message.create({
    data: {
      author: 'USER',
      content: userPrompt,
      conversationId,
      createdAt: new Date(),
    },
  });

  const history = await prisma.message.findMany({
    where: { conversationId, videoId: null },
    orderBy: { createdAt: "asc" },
    take: 20,
  });

  const messages = [
    { role: "system", content: systemInstructions },
    ...history.map(m => ({ role: m.author.toLowerCase(), content: m.content }))
  ] as OpenAI.ChatCompletionMessageParam[];

  const response = await openai.chat.completions.create({
    model: "gemini-2.0-flash",
    messages: messages,
  });

  const assistantMessage = response.choices[0].message.content ?? "Got no response.";

  const message = await prisma.message.create({
    data: {
      conversationId,
      author: "ASSISTANT",
      content: assistantMessage
    }
  });

  const assistantResponse = {
    id: message.id,
    role: "assistant" as const,
    content: assistantMessage,
    timestamp: message.createdAt
  }

  return { assistantResponse, conversationId };
}
