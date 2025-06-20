"use server";

import prisma from "@/db/prisma";
import axios from "axios";
import { revalidatePath } from "next/cache";

type ReturnType = {
  status: "success" | "error";
  message: string;
  videoUrl: string | null;
};

const retryAxios = async <T>(fn: () => Promise<T>, retries = 3): Promise<T> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      console.warn(`Retrying video generation attempt ${i + 1}...`);
      await new Promise((res) => setTimeout(res, 1000 * (i + 1)));
    }
  }
  throw new Error("retryAxios: All retries failed but no error was thrown.");
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
      videoUrl: null,
    };
  }

  const baseUrl = process.env.WORKER_URL;
  if (!baseUrl) {
    console.error("Server misconfiguration: WORKER_URL environment variable is not set.");
    return {
      status: "error",
      message: "A server configuration error occurred. Please contact support.",
      videoUrl: null,
    };
  }

  try {
    const apiUrl = new URL("/generate", baseUrl).toString();

    const response = await retryAxios(() =>
      axios.post(
        apiUrl,
        { codeContent, quality },
        { headers: { "Content-Type": "application/json" } }
      )
    );

    const { videoUrl, message: successMessage }: { videoUrl: string; message?: string } = response.data;

    const updatedMessage = await prisma.$transaction(async (tx) => {
      const video = await tx.video.create({
        data: {
          message: { connect: { id: messageId } },
          status: "COMPLETED",
          url: videoUrl,
        },
      });

      return await tx.message.update({
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
    });

    const conversationId = updatedMessage.conversation?.id;
    if (conversationId) {
      revalidatePath(`/chat/${conversationId}`);
    }

    return {
      status: "success",
      message: successMessage || "Video generated successfully!",
      videoUrl,
    };
  } catch (error) {
    console.error("Error in approveAndGenerateVideo:", error);

    if (axios.isAxiosError(error)) {
      console.error("Worker responded with:", error.response?.status, error.response?.data);

      return {
        status: "error",
        message: error.response?.data?.message || "The video generation service failed.",
        videoUrl: null,
      };
    }

    return {
      status: "error",
      message: "An unexpected error occurred while saving the video details.",
      videoUrl: null,
    };
  }
};
