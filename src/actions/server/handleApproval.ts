"use server";

import prisma from "@/db/prisma";
import axios from "axios";
import { revalidatePath } from "next/cache";
import { checkVideoRateLimit, incrementVideoCount } from "@/lib/rate-limiting";

type ReturnType = {
  status: "success" | "error";
  message: string;
  videoId: string | null;
};

const retryAxios = async <T>(fn: () => Promise<T>, retries = 3): Promise<T> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      console.warn(`Retrying API call, attempt ${i + 2}/${retries}...`);
      await new Promise((res) => setTimeout(res, 1000 * (i + 1)));
    }
  }
  throw new Error("retryAxios: All retries failed.");
};

export const approveAndGenerateVideo = async (
  messageId: string,
  codeContent: string,
  quality: "-qm" | "-qh" = "-qm"
): Promise<ReturnType> => {

  if (!codeContent.trim()) {
    return {
      status: "error",
      message: "Code content cannot be empty.",
      videoId: null,
    };
  }

  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: {
      conversation: {
        select: { userId: true }
      }
    }
  });

  if (!message) {
    return {
      status: "error",
      message: "Message not found.",
      videoId: null,
    };
  }

  const rateLimitCheck = await checkVideoRateLimit(message.conversation.userId);
  if (!rateLimitCheck.allowed) {
    return {
      status: "error",
      message: rateLimitCheck.message || "Video generation rate limit exceeded",
      videoId: null,
    };
  }

  const baseUrl = process.env.WORKER_URL;
  if (!baseUrl) {
    console.error("Server misconfiguration: WORKER_URL environment variable is not set.");
    return {
      status: "error",
      message: "A server configuration error occurred. Please contact support.",
      videoId: null,
    };
  }

  try {
    const apiUrl = new URL("/api/render", baseUrl).toString();

    const response = await retryAxios(() =>
      axios.post(
        apiUrl,
        { codeContent, quality },
        { headers: { "Content-Type": "application/json" } }
      )
    );

    const { s3Key, message: successMessage }: { s3Key: string; message?: string } = response.data;

    if (!s3Key) {
        throw new Error("Worker did not return a valid s3Key.");
    }

    const transactionResult = await prisma.$transaction(async (tx) => {
      const video = await tx.video.create({
        data: {
          message: { connect: { id: messageId } },
          status: "COMPLETED",
          s3Key: s3Key,
        },
      });

      const updatedMessage = await tx.message.update({
        where: { id: messageId },
        data: {
          isApproved: true,
          videoId: video.id,
        },
        include: {
          conversation: {
            select: { id: true },
          },
        },
      });

      return { newVideoId: video.id, conversationId: updatedMessage.conversation?.id };
    });

    await incrementVideoCount(message.conversation.userId);

    if (transactionResult.conversationId) {
      revalidatePath(`/chat/${transactionResult.conversationId}`);
    }

    return {
      status: "success",
      message: successMessage || "Video generated and saved successfully!",
      videoId: transactionResult.newVideoId,
    };

  } catch (error) {
    console.error("Error in approveAndGenerateVideo:", error);

    if (axios.isAxiosError(error)) {
      console.error("Worker responded with:", error.response?.status, error.response?.data);
      return {
        status: "error",
        message: error.response?.data?.message || "The video generation service failed.",
        videoId: null,
      };
    }

    return {
      status: "error",
      message: "An unexpected error occurred while saving the video details.",
      videoId: null,
    };
  }
};