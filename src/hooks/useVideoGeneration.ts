import { useState, useCallback, useRef } from 'react';
import { useVideoStore } from './useVideoStore';
import { generateVideo } from '@/lib/grok-client';
import { GrokVideoResponse } from '@/types/api';
import { GeneratedVideo } from '@/types/video';
import { buildVideoPrompt } from '@/lib/prompt-builder';

export interface UseVideoGenerationOptions {
  onScreenshotNeeded: (videoPath: string) => Promise<string | null>;
}

export interface UseVideoGenerationReturn {
  // State
  currentStatus: 'idle' | 'generating' | 'success' | 'error';
  errorMessage: string | null;
  progress: number;
  isGenerating: boolean;

  // Actions
  generateCurrentScene: () => Promise<void>;
  generateAllScenes: () => Promise<void>;
  resetGeneration: () => void;
}

export function useVideoGeneration(
  options: UseVideoGenerationOptions
): UseVideoGenerationReturn {
  const { onScreenshotNeeded } = options;

  const {
    scenes,
    selectedStyle,
    script,
    characterPrompt,
    voicePrompt,
    hook,
    currentSceneIndex,
    setCurrentSceneIndex,
    addGeneratedVideo,
    generatedVideos,
  } = useVideoStore();

  const [currentStatus, setCurrentStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const abortRef = useRef(false);

  const getPromptForScene = useCallback(
    (sceneNumber: number): { prompt: string; screenshot?: string } | null => {
      if (!selectedStyle) return null;

      const scene = scenes[sceneNumber - 1];
      if (!scene) return null;

      const previousVideo = generatedVideos[generatedVideos.length - 1];
      const previousScreenshot = previousVideo?.screenshotPath;

      const prompt = buildVideoPrompt({
        script,
        style: selectedStyle,
        character: characterPrompt,
        voice: voicePrompt,
        scene,
        hook,
        previousScreenshot,
        sceneNumber,
        totalScenes: scenes.length,
      });

      return { prompt, screenshot: previousScreenshot };
    },
    [scenes, selectedStyle, script, characterPrompt, voicePrompt, hook, generatedVideos]
  );

  const generateSingleScene = useCallback(
    async (sceneNumber: number): Promise<boolean> => {
      const result = getPromptForScene(sceneNumber);
      if (!result) {
        setErrorMessage('Configuración incompleta');
        return false;
      }

      setCurrentStatus('generating');
      setErrorMessage(null);

      try {
        const response: GrokVideoResponse = await generateVideo(
          {
            prompt: result.prompt,
            image: result.screenshot,
            sceneNumber,
          },
          sceneNumber
        );

        if (!response.success || !response.videoUrl) {
          throw new Error(response.error || 'Failed to generate video');
        }

        // Extract screenshot for next scene
        const screenshotPath = await onScreenshotNeeded(response.videoUrl);

        // Save generated video
        const video: GeneratedVideo = {
          id: `video_${Date.now()}_${sceneNumber}`,
          sceneNumber,
          videoPath: response.videoUrl,
          screenshotPath: screenshotPath || '',
          prompt: result.prompt,
          createdAt: new Date(),
        };

        addGeneratedVideo(video);
        setCurrentStatus('success');

        return true;
      } catch (error) {
        setCurrentStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
        return false;
      }
    },
    [getPromptForScene, onScreenshotNeeded, addGeneratedVideo]
  );

  const generateCurrentScene = useCallback(async () => {
    if (abortRef.current) {
      abortRef.current = false;
      return;
    }

    const success = await generateSingleScene(currentSceneIndex);

    if (success && currentSceneIndex < scenes.length) {
      // Move to next scene after delay
      setTimeout(() => {
        if (!abortRef.current) {
          setCurrentSceneIndex(currentSceneIndex + 1);
          setCurrentStatus('idle');
          setProgress((currentSceneIndex / scenes.length) * 100);
        }
      }, 1500);
    } else if (success && currentSceneIndex === scenes.length) {
      setProgress(100);
    }
  }, [currentSceneIndex, scenes.length, generateSingleScene, setCurrentSceneIndex]);

  const generateAllScenes = useCallback(async () => {
    abortRef.current = false;
    setProgress(0);

    for (let i = 1; i <= scenes.length; i++) {
      if (abortRef.current) break;

      setCurrentSceneIndex(i);
      const success = await generateSingleScene(i);

      if (!success) {
        console.error(`Failed to generate scene ${i}`);
        break;
      }

      setProgress((i / scenes.length) * 100);

      // Delay between scenes
      if (i < scenes.length && !abortRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }, [scenes.length, generateSingleScene, setCurrentSceneIndex]);

  const resetGeneration = useCallback(() => {
    abortRef.current = true;
    setCurrentStatus('idle');
    setErrorMessage(null);
    setProgress(0);
  }, []);

  return {
    currentStatus,
    errorMessage,
    progress,
    isGenerating: currentStatus === 'generating',
    generateCurrentScene,
    generateAllScenes,
    resetGeneration,
  };
}
