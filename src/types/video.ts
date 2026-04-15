export interface VideoStyle {
  id: string;
  title: string;
  description: string;
  isCustom: boolean;
}

export interface VideoConfig {
  script: string;
  style: VideoStyle | null;
  characterPrompt: string;
  voicePrompt: string;
  sceneCount: number;
  hook: string;
}

export interface GeneratedVideo {
  id: string;
  sceneNumber: number;
  videoPath: string;
  screenshotPath: string;
  prompt: string;
  createdAt: Date;
}

export interface VideoGenerationState {
  config: VideoConfig;
  videos: GeneratedVideo[];
  currentScene: number;
  isGenerating: boolean;
  isLoading: boolean;
  error: string | null;
}
