"use client";

import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, AlertTriangle } from "lucide-react";
import axios from "axios";

interface UsageStats {
  tokensUsed: number;
  videosCreated: number;
  remaining: {
    tokens: number;
    videos: number;
  };
}

const DAILY_TOKEN_LIMIT = 250000;
const DAILY_VIDEO_LIMIT = 5;

export function RateLimitAlert() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/usage');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch usage stats for alert:', error);
      }
    };

    fetchStats();
    
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!stats || dismissed) return null;

  const tokenPercentage = (stats.tokensUsed / DAILY_TOKEN_LIMIT) * 100;
  const videoPercentage = (stats.videosCreated / DAILY_VIDEO_LIMIT) * 100;

  const showTokenAlert = tokenPercentage >= 80;
  const showVideoAlert = videoPercentage >= 80;

  if (!showTokenAlert && !showVideoAlert) return null;

  const isNearLimit = tokenPercentage >= 95 || videoPercentage >= 100;

  return (
    <Alert className={`mb-4 ${isNearLimit ? 'border-destructive' : 'border-orange-500'}`}>
      <AlertTriangle className={`h-4 w-4 ${isNearLimit ? 'text-destructive' : 'text-orange-500'}`} />
      <AlertDescription className="flex justify-between items-center">
        <div>
          {showTokenAlert && (
            <p className="text-sm">
              <strong>Token Usage:</strong> {Math.round(tokenPercentage)}% used 
              ({stats.tokensUsed.toLocaleString()}/{DAILY_TOKEN_LIMIT.toLocaleString()})
            </p>
          )}
          {showVideoAlert && (
            <p className="text-sm">
              <strong>Video Generation:</strong> {stats.videosCreated}/{DAILY_VIDEO_LIMIT} videos used
            </p>
          )}
          {isNearLimit && (
            <p className="text-xs mt-1 text-muted-foreground">
              You&apos;re approaching your daily limits. Consider upgrading for unlimited usage.
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDismissed(true)}
          className="ml-2"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
}
