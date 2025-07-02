import { NextResponse } from "next/server";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { VideoStatus } from "@prisma/client";
import prisma from "@/db/prisma";

export async function GET() {
  try {
    const session: Session | null = await getServerSession(authOptions);

    if(!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const videos = await prisma.video.findMany({
      where: {
        status: VideoStatus.COMPLETED,
        message: {
          conversation: {
            userId: session.user.id,
          },
        },
      },
      select: {
        id: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(videos);
  } catch (error) {
    console.error("[GALLERY_GET_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
