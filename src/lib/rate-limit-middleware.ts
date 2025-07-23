import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getUserUsageStats, DAILY_TOKEN_LIMIT, DAILY_VIDEO_LIMIT } from "@/lib/rate-limiting";

export async function withRateLimitHeaders(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    
    if (session?.user?.id) {
      const stats = await getUserUsageStats(session.user.id);
      
      if (stats) {
        response.headers.set('X-RateLimit-Token-Limit', DAILY_TOKEN_LIMIT.toString());
        response.headers.set('X-RateLimit-Token-Remaining', stats.remaining.tokens.toString());
        response.headers.set('X-RateLimit-Token-Used', stats.tokensUsed.toString());
        
        response.headers.set('X-RateLimit-Video-Limit', DAILY_VIDEO_LIMIT.toString());
        response.headers.set('X-RateLimit-Video-Remaining', stats.remaining.videos.toString());
        response.headers.set('X-RateLimit-Video-Used', stats.videosCreated.toString());
        
        const tomorrow = new Date();
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
        tomorrow.setUTCHours(0, 0, 0, 0);
        response.headers.set('X-RateLimit-Reset', Math.floor(tomorrow.getTime() / 1000).toString());
      }
    }
  } catch (error) {
    console.error('Error adding rate limit headers:', error);
  }
  
  return response;
}

export function createRateLimitErrorResponse(message: string, remaining?: { tokens: number; videos: number }) {
  const response = NextResponse.json(
    { 
      error: message,
      type: 'RATE_LIMIT_EXCEEDED',
      remaining 
    },
    { status: 429 }
  );

  response.headers.set('Retry-After', '86400');
  
  return response;
}
