export type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  language?: string;
  videoUrl?: string;
  timestamp: Date;
  isApproved?: boolean;
};