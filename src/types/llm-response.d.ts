export type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  language?: string;
  videoId?: string | null;
  timestamp: Date;
  isApproved?: boolean;
  isRejected?: boolean;
};
