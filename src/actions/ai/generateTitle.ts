'use server';

import OpenAI from "openai";
import prisma from "@/db/prisma";

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export type MessageType = {
  role: "user" | "assistant";
  content: string;
};

function isTrivialConversation(messages: MessageType[]): boolean {
  const fullText = messages.map(m => m.content.toLowerCase()).join(" ");
  const greetings = [
    "hi", "hello", "hey", "how are you",
    "good morning", "good evening", "what's up",
    "sup", "yo", "hello there", "hi there"
  ];

  const isShort = fullText.replace(/\s+/g, "").length < 40;
  const isMostlyGreeting = greetings.some(greet => fullText.includes(greet));

  return isShort && isMostlyGreeting;
}

export async function generateTitle(conversationId: string, messages: MessageType[]) {
  if (isTrivialConversation(messages)) return;

  const examples: MessageType[] = [
    { role: "user", content: "How do I use the `useEffect` hook in React to fetch data from an API and handle loading states?" },
    { role: "assistant", content: "React useEffect Data Fetching" },
    { role: "user", content: "Can you write me a short, rhyming poem about a cat watching a thunderstorm?" },
    { role: "assistant", content: "Poem: Cat in a Storm" },
    { role: "user", content: "I'm planning a 10-day trip to Japan. What's a good itinerary that covers Tokyo and Kyoto but isn't too rushed?" },
    { role: "assistant", content: "10-Day Japan Itinerary" },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "system",
          content: "You are an expert at creating short, concise titles for conversations. Based on the user's messages, provide a title that captures the main topic. The title should be a 2-5 word noun phrase. Do not use quotation marks."
        },
        ...examples,
        ...messages.map(({ role, content }) => ({ role, content })),
        { role: "user", content: "Generate a short title for the conversation above." }
      ],
      temperature: 0.2,
      max_tokens: 25,
    });

    const title = completion.choices[0].message.content?.trim().slice(0, 100) || "New chat";
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { title },
    });

    return { success: true, newTitle: title };
  } catch (error) {
    console.error("Error generating title:", error);
    return { success: false, error: "Failed to generate title" };
  }
};
