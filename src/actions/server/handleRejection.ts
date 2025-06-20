"use server";

import prisma from "@/db/prisma";

type RejectResult = {
  success: boolean;
  message: string;
};

const rejectGenerateVideo = async (messageId: string): Promise<RejectResult> => {
  try {
    await prisma.message.update({
      where: { id: messageId },
      data: { isRejected: true }
    });
    
    return {
      success: true,
      message: "Code rejection successful.",
    }
  } catch (error) {
    console.error("An error occurred: ", error);
    return {
      success: false,
      message: "Code rejection unsuccessful. Try again later."
    }
  }
}

export default rejectGenerateVideo;