export interface GeminiRequest {
  contents: {
    parts: {
      text: string;
    }[];
  }[];
}

export interface GeminiResponseSuccess {
  candidates: Array<{
    content?: {
      parts?: Array<{
        text: string;
      }>;
    };
  }>;
}

export interface GeminiResponseError {
  error: {
    code?: number;
    message: string;
    status?: string;
  };
}

export type GenerateCodeResponse =
  | { manimCode: string; error?: undefined }
  | { error: string; manimCode?: undefined };


export type GeminiResponse = GeminiResponseSuccess | GeminiResponseError;
