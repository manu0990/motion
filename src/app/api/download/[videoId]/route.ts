import { NextResponse, NextRequest } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  ...(process.env.S3_ENDPOINT && {
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: true,
  }),
});

const BUCKET = process.env.S3_BUCKET_NAME!;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { videoId } = await params;
    if (!videoId) {
      return new NextResponse("Video ID is required", { status: 400 });
    }

    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        message: {
          include: {
            conversation: {
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!video || !video.s3Key) {
      return new NextResponse("Video not found", { status: 404 });
    }
    if (video.message.conversation.userId !== session.user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const cmd = new GetObjectCommand({
      Bucket: BUCKET,
      Key: video.s3Key,
    });
    const s3obj = await s3Client.send(cmd);

    if (!s3obj.Body) {
      throw new Error("S3 object has no body");
    }

    return new NextResponse(s3obj.Body as ReadableStream, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": s3obj.ContentLength?.toString() || "",
        "Accept-Ranges": "bytes",
        "Content-Disposition": `attachment; filename="Motion-${videoId}.mp4"`,
      },
    });
  } catch (err) {
    console.error("Download error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
