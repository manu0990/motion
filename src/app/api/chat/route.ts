import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getLLMResponse } from "@/actions/ai/getLLMResponse";
import { getUserUsageStats } from "@/lib/rate-limiting";
import { z } from "zod";

const chatSchema = z.object({
  userPrompt: z.string().min(1, "Message cannot be empty").max(10000, "Message too long"),
  conversationId: z.string().optional(),
  modelType: z.enum(["fast", "think"]).default("fast"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parseResult = chatSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const { userPrompt, conversationId, modelType } = parseResult.data;

    try {
      const result = await getLLMResponse({
        conversationId: conversationId || "",
        userId: session.user.id,
        userPrompt,
        modelType,
      });

      // Get updated usage stats to include in headers
      const updatedStats = await getUserUsageStats(session.user.id);
      
      const response = NextResponse.json(result);
      
      if (updatedStats) {
        response.headers.set('X-RateLimit-Token-Used', updatedStats.tokensUsed.toString());
        response.headers.set('X-RateLimit-Token-Remaining', updatedStats.remaining.tokens.toString());
        response.headers.set('X-RateLimit-Video-Used', updatedStats.videosCreated.toString());
        response.headers.set('X-RateLimit-Video-Remaining', updatedStats.remaining.videos.toString());
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes("Rate limit")) {
        return NextResponse.json(
          { 
            error: error.message,
            type: 'RATE_LIMIT_EXCEEDED'
          },
          { status: 429 }
        );
      }

      console.error("Error in chat API:", error);
      return NextResponse.json(
        { error: "Failed to process your message. Please try again." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
