import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(
  req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const { conversationId } = params;
    if (!conversationId) {
      return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.redirect("/signin");
    }

    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId: session.user.id },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found or not owned by user" },
        { status: 404 }
      );
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });

    const messagesWithVideoUrl = await Promise.all(
      messages.map(async (msg) => {
        let videoUrl = null;
        if (msg.videoId) {
          const video = await prisma.video.findFirst({ where: { id: msg.videoId } });
          videoUrl = video ? video.url : null;
        }
        return {
          id: msg.id,
          role: msg.author.toLowerCase(),
          content: msg.content,
          timestamp: msg.createdAt,
          videoUrl,
        };
      })
    );

    return NextResponse.json(messagesWithVideoUrl);
  } catch (err) {
    console.error("API /api/chat/[conversationId] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
