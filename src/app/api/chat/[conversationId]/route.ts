import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(req: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {

  try {
    const { conversationId } = await params;
    
    if (!conversationId) {
      return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId,
        conversation: {
          userId: session.user.id,
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // If no messages are found, it could also mean the conversation doesn't exist or isn't owned by the user
    if (messages.length === 0) {
      const conversationExists = await prisma.conversation.count({ where: { id: conversationId, userId: session.user.id } });
      if (conversationExists === 0) {
        return NextResponse.json({ error: "Conversation not found or not owned by user" }, { status: 404 });
      }
    }

    const formattedMessages = messages.map((msg) => {
      return {
        id: msg.id,
        role: msg.author.toLowerCase(),
        content: msg.content,
        timestamp: msg.createdAt,
        videoId: msg.videoId,
        isApproved: msg.isApproved,
        isRejected: msg.isRejected,
      };
    });

    return NextResponse.json(formattedMessages);

  } catch (err) {
    console.error("API /api/chat/[conversationId] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}