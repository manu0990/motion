"use client";

import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Video, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUsageStats } from "@/context/UsageStatsProvider";

const DAILY_TOKEN_LIMIT = 150000;
const DAILY_VIDEO_LIMIT = 3;

export function UsageStatsCard() {
  const { stats, loading, error, refreshStats } = useUsageStats();

  // Load initial stats when component mounts
  useEffect(() => {
    if (!stats && !loading) {
      refreshStats();
    }
  }, [stats, loading, refreshStats]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Token Usage Skeleton */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-3 w-32" />
          </div>

          {/* Video Generation Skeleton */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-3 w-28" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
          <CardDescription>{error || 'Unable to load usage statistics'}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={refreshStats} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Retry'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const tokenPercentage = (stats.tokensUsed / DAILY_TOKEN_LIMIT) * 100;
  const videoPercentage = (stats.videosCreated / DAILY_VIDEO_LIMIT) * 100;

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "destructive";
    if (percentage >= 70) return "secondary";
    return "default";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Daily Usage</CardTitle>
          <Button onClick={refreshStats} variant="ghost" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <CardDescription>
          Your current usage for today. Limits reset daily at midnight UTC.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Token Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <span className="text-sm pr-2 font-medium">Tokens </span>
            </div>
            <Badge variant={getUsageColor(tokenPercentage)}>
              {stats.tokensUsed.toLocaleString()} / {DAILY_TOKEN_LIMIT.toLocaleString()}
            </Badge>
          </div>
          <Progress value={tokenPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {stats.remaining.tokens.toLocaleString()} tokens remaining
          </p>
        </div>

        {/* Video Generation */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Videos</span>
            </div>
            <Badge variant={getUsageColor(videoPercentage)}>
              {stats.videosCreated} / {DAILY_VIDEO_LIMIT}
            </Badge>
          </div>
          <Progress value={videoPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {stats.remaining.videos} videos remaining
          </p>
        </div>

        {/* Warning Messages */}
        {tokenPercentage >= 90 && (
          <div className="rounded-md bg-destructive/10 p-3">
            <p className="text-sm text-destructive">
              ⚠️ You&apos;re approaching your daily token limit.
            </p>
          </div>
        )}

        {videoPercentage >= 80 && (
          <div className="rounded-md bg-destructive/10 p-3">
            <p className="text-sm text-destructive">
              ⚠️ You&apos;re approaching your daily video generation limit.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
