'use client';

import { useState, useCallback } from 'react';
import { useVideoStore } from '@/hooks/useVideoStore';
import { generateVideo } from '@/lib/grok-client';
import { GrokVideoResponse } from '@/types/api';
import { GeneratedVideo } from '@/types/video';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Video, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface VideoGeneratorProps {
  onScreenshotNeeded: (videoPath: string) => Promise<string | null>;
}

export function VideoGenerator({ onScreenshotNeeded }: VideoGeneratorProps) {
  const {
    scenes,
    currentSceneIndex,
    setCurrentSceneIndex,
    isGenerating,
    setIsGenerating,
    addGeneratedVideo,
    generatedVideos,
  } = useVideoStore();

  const [currentStatus, setCurrentStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const totalScenes = scenes.length;
  const completedScenes = generatedVideos.length;

  const generateScene = useCallback(async (sceneNumber: number, prompt: string, screenshot?: string) => {
    setCurrentStatus('generating');
    setErrorMessage(null);
    setIsGenerating(true);

    try {
      // Call Grok API
      const response: GrokVideoResponse = await generateVideo(
        {
          prompt,
          image: screenshot,
          sceneNumber,
        },
        sceneNumber
      );

      if (!response.success || !response.videoUrl) {
        throw new Error(response.error || 'Failed to generate video');
      }

      // Request screenshot extraction
      const screenshotPath = await onScreenshotNeeded(response.videoUrl);

      // Save generated video
      const video: GeneratedVideo = {
        id: `video_${Date.now()}`,
        sceneNumber,
        videoPath: response.videoUrl,
        screenshotPath: screenshotPath || '',
        prompt,
        createdAt: new Date(),
      };

      addGeneratedVideo(video);
      setCurrentStatus('success');

      // Move to next scene
      if (sceneNumber < totalScenes) {
        setTimeout(() => {
          setCurrentSceneIndex(sceneNumber);
          setCurrentStatus('idle');
          setProgress(((sceneNumber) / totalScenes) * 100);
        }, 1500);
      } else {
        setProgress(100);
      }
    } catch (error) {
      setCurrentStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsGenerating(false);
    }
  }, [totalScenes, setCurrentSceneIndex, setIsGenerating, addGeneratedVideo, onScreenshotNeeded]);

  const startGeneration = useCallback(async (prompt: string, screenshot?: string) => {
    await generateScene(1, prompt, screenshot);
  }, [generateScene]);

  const continueToNextScene = useCallback(async (prompt: string, screenshot?: string) => {
    const nextScene = currentSceneIndex + 1;
    await generateScene(nextScene, prompt, screenshot);
  }, [currentSceneIndex, generateScene]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Generador de Video
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progreso</span>
            <span>{completedScenes} / {totalScenes} escenas</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Current Status */}
        <div className="flex items-center gap-2 p-4 rounded-lg bg-muted">
          {currentStatus === 'idle' && (
            <>
              <div className="h-3 w-3 rounded-full bg-muted-foreground" />
              <span className="text-sm">Esperando para comenzar...</span>
            </>
          )}
          {currentStatus === 'generating' && (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Generando escena {currentSceneIndex}...</span>
            </>
          )}
          {currentStatus === 'success' && (
            <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700">¡Escena {currentSceneIndex} completada!</span>
            </>
          )}
          {currentStatus === 'error' && (
            <>
              <XCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">{errorMessage}</span>
            </>
          )}
        </div>

        {/* Generated Videos List */}
        {generatedVideos.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Videos Generados</h4>
            <div className="space-y-2">
              {generatedVideos.map((video) => (
                <div
                  key={video.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Escena {video.sceneNumber}</span>
                  </div>
                  <a
                    href={video.videoPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Ver video
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Export Button */}
        {completedScenes === totalScenes && completedScenes > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm text-green-700 mb-2">
              ¡Todas las escenas han sido generadas!
            </p>
            <Button variant="outline">
              Exportar Video Completo
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Re-export for use in parent component
export type { VideoGeneratorProps };
