"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";

interface UsageStats {
  tokensUsed: number;
  videosCreated: number;
  remaining: {
    tokens: number;
    videos: number;
  };
}

interface UsageStatsContextType {
  stats: UsageStats | null;
  loading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
  updateStatsFromResponse: (response: { headers?: Record<string, unknown>; config?: { headers?: Record<string, unknown> } }) => void;
}

const UsageStatsContext = createContext<UsageStatsContextType | undefined>(undefined);

export function useUsageStats() {
  const context = useContext(UsageStatsContext);
  if (!context) {
    throw new Error("useUsageStats must be used within a UsageStatsProvider");
  }
  return context;
}

interface UsageStatsProviderProps {
  children: React.ReactNode;
}

export function UsageStatsProvider({ children }: UsageStatsProviderProps) {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/usage');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching usage stats:', err);
      setError('Failed to load usage statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatsFromResponse = useCallback((response: { headers?: Record<string, unknown>; config?: { headers?: Record<string, unknown> } }) => {
    // Check if the response contains rate limit headers
    const headers = response.headers || response.config?.headers || {};
    
    const tokenUsed = headers['x-ratelimit-token-used'];
    const tokenRemaining = headers['x-ratelimit-token-remaining'];
    const videoUsed = headers['x-ratelimit-video-used'];
    const videoRemaining = headers['x-ratelimit-video-remaining'];

    // Helper function to safely parse header values
    const parseHeaderValue = (value: unknown): number => {
      if (typeof value === 'string') {
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? 0 : parsed;
      }
      if (typeof value === 'number') {
        return value;
      }
      if (Array.isArray(value) && value.length > 0) {
        const firstValue = value[0];
        if (typeof firstValue === 'string') {
          const parsed = parseInt(firstValue, 10);
          return isNaN(parsed) ? 0 : parsed;
        }
        if (typeof firstValue === 'number') {
          return firstValue;
        }
      }
      return 0;
    };

    if (tokenUsed !== undefined && tokenRemaining !== undefined && 
        videoUsed !== undefined && videoRemaining !== undefined) {
      setStats({
        tokensUsed: parseHeaderValue(tokenUsed),
        videosCreated: parseHeaderValue(videoUsed),
        remaining: {
          tokens: parseHeaderValue(tokenRemaining),
          videos: parseHeaderValue(videoRemaining)
        }
      });
    }
  }, []);

  const value = {
    stats,
    loading,
    error,
    refreshStats,
    updateStatsFromResponse,
  };

  return (
    <UsageStatsContext.Provider value={value}>
      {children}
    </UsageStatsContext.Provider>
  );
}
