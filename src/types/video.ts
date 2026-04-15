// VideoStyle is defined in style.ts and re-exported here for convenience
// All VideoStyle definitions should be in src/types/style.ts
export type { VideoStyle, CustomStyle } from './style';

export interface VideoConfig {
  script: string;
  style: import('./style').VideoStyle | null;
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
