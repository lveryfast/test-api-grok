export interface GrokVideoRequest {
  prompt: string;
  image?: string;
  sceneNumber: number;
}

export interface GrokVideoResponse {
  success: boolean;
  videoUrl?: string;
  error?: string;
  tokens?: number;
  cost?: number;
}

export interface GrokApiLog {
  id: string;
  timestamp: string;
  sceneNumber: number;
  request: {
    prompt: string;
    hasImage: boolean;
  };
  response: GrokVideoResponse;
  duration: number;
}
