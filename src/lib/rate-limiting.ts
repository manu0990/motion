import prisma from "@/db/prisma";


export const DAILY_TOKEN_LIMIT = 150000;
export const DAILY_VIDEO_LIMIT = 3;

export interface RateLimitResult {
  allowed: boolean;
  message?: string;
  remaining?: {
    tokens: number;
    videos: number;
  };
}

export function countTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

async function resetDailyCountersIfNeeded(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastResetDate: true }
  });

  if (!user) return;

  const now = new Date();
  const lastReset = new Date(user.lastResetDate);

  const isNewDay = now.getUTCDate() !== lastReset.getUTCDate() ||
    now.getUTCMonth() !== lastReset.getUTCMonth() ||
    now.getUTCFullYear() !== lastReset.getUTCFullYear();

  if (isNewDay) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        tokensUsedToday: 0,
        videosCreatedToday: 0,
        lastResetDate: now
      }
    });
  }
}

export async function checkTokenRateLimit(userId: string, tokensToAdd: number): Promise<RateLimitResult> {
  await resetDailyCountersIfNeeded(userId);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tokensUsedToday: true, videosCreatedToday: true }
  });

  if (!user) {
    return { allowed: false, message: "User not found" };
  }

  const newTokenCount = user.tokensUsedToday + tokensToAdd;

  if (newTokenCount > DAILY_TOKEN_LIMIT) {
    return {
      allowed: false,
      message: `Daily token limit exceeded. You have used ${user.tokensUsedToday}/${DAILY_TOKEN_LIMIT} tokens today.`,
      remaining: {
        tokens: Math.max(0, DAILY_TOKEN_LIMIT - user.tokensUsedToday),
        videos: Math.max(0, DAILY_VIDEO_LIMIT - user.videosCreatedToday)
      }
    };
  }

  return {
    allowed: true,
    remaining: {
      tokens: DAILY_TOKEN_LIMIT - newTokenCount,
      videos: Math.max(0, DAILY_VIDEO_LIMIT - user.videosCreatedToday)
    }
  };
}

export async function checkVideoRateLimit(userId: string): Promise<RateLimitResult> {
  await resetDailyCountersIfNeeded(userId);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tokensUsedToday: true, videosCreatedToday: true }
  });

  if (!user) {
    return { allowed: false, message: "User not found" };
  }

  if (user.videosCreatedToday >= DAILY_VIDEO_LIMIT) {
    return {
      allowed: false,
      message: `Daily video generation limit exceeded. You have created ${user.videosCreatedToday}/${DAILY_VIDEO_LIMIT} videos today.`,
      remaining: {
        tokens: Math.max(0, DAILY_TOKEN_LIMIT - user.tokensUsedToday),
        videos: 0
      }
    };
  }

  return {
    allowed: true,
    remaining: {
      tokens: Math.max(0, DAILY_TOKEN_LIMIT - user.tokensUsedToday),
      videos: DAILY_VIDEO_LIMIT - user.videosCreatedToday - 1
    }
  };
}

export async function incrementTokenUsage(userId: string, tokenCount: number): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      tokensUsedToday: {
        increment: tokenCount
      }
    }
  });
}

export async function incrementVideoCount(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      videosCreatedToday: {
        increment: 1
      }
    }
  });
}

export async function getUserUsageStats(userId: string): Promise<{
  tokensUsed: number;
  videosCreated: number;
  remaining: {
    tokens: number;
    videos: number;
  };
} | null> {
  await resetDailyCountersIfNeeded(userId);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tokensUsedToday: true, videosCreatedToday: true }
  });

  if (!user) return null;

  return {
    tokensUsed: user.tokensUsedToday,
    videosCreated: user.videosCreatedToday,
    remaining: {
      tokens: Math.max(0, DAILY_TOKEN_LIMIT - user.tokensUsedToday),
      videos: Math.max(0, DAILY_VIDEO_LIMIT - user.videosCreatedToday)
    }
  };
}
