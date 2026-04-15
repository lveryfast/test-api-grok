'use client';

import { useCallback } from 'react';
import { useVideoStore } from '@/hooks/useVideoStore';
import { useVideoGeneration } from '@/hooks/useVideoGeneration';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Video, CheckCircle, XCircle, Loader2, Play, Square } from 'lucide-react';

interface VideoGeneratorProps {
  onScreenshotNeeded: (videoPath: string) => Promise<string | null>;
}

export function VideoGenerator({ onScreenshotNeeded }: VideoGeneratorProps) {
  const {
    scenes,
    currentSceneIndex,
    generatedVideos,
  } = useVideoStore();

  const {
    currentStatus,
    errorMessage,
    progress,
    isGenerating,
    generateCurrentScene,
    generateAllScenes,
    resetGeneration,
  } = useVideoGeneration({ onScreenshotNeeded });

  const totalScenes = scenes.length;
  const completedScenes = generatedVideos.length;
  const currentScene = scenes[currentSceneIndex - 1];

  // Check if current scene has content
  const isSceneComplete =
    currentScene?.dialogue?.trim() !== '' &&
    currentScene?.description?.trim() !== '';

  const canGenerate =
    isSceneComplete &&
    currentStatus !== 'generating' &&
    currentSceneIndex <= totalScenes;

  const isAllComplete = completedScenes === totalScenes;

  return (
    <Card className="card-hover borderBorder/50 overflow-hidden">
      <CardHeader className="border-b border-border/30 bg-gradient-to-r from-transparent to-primary/5">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Video className="h-5 w-5" />
          </div>
          <span>Generador</span>
          <div className="ml-auto">
            <span className="text-sm font-normal text-muted-foreground">
              {completedScenes}/{totalScenes} escenas
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progreso</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 min-h-[56px]">
          {currentStatus === 'idle' && (
            <>
              <div className="w-3 h-3 rounded-full bg-muted-foreground/50" />
              <span className="text-sm">Listo para generar</span>
            </>
          )}
          {currentStatus === 'generating' && (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm">Generando escena {currentSceneIndex}...</span>
            </>
          )}
          {currentStatus === 'success' && (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm text-green-500">
                Escena {currentSceneIndex} completada
              </span>
            </>
          )}
          {currentStatus === 'error' && (
            <>
              <XCircle className="h-5 w-5 text-destructive" />
              <span className="text-sm text-destructive">{errorMessage}</span>
            </>
          )}
        </div>

        {/* Generated Videos List */}
        {generatedVideos.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Videos Generados</h4>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {generatedVideos.map((video) => (
                <div
                  key={video.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
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

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-border/30">
          {!isGenerating && !isAllComplete && (
            <Button onClick={generateCurrentScene} disabled={!canGenerate} className="glow-green">
              <Play className="h-4 w-4 mr-2" />
              Generar Escena {currentSceneIndex}
            </Button>
          )}

          {isGenerating && (
            <Button onClick={resetGeneration} variant="destructive">
              <Square className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          )}

          {!isGenerating && !isAllComplete && completedScenes < totalScenes && (
            <Button variant="outline" onClick={generateAllScenes}>
              <Play className="h-4 w-4 mr-2" />
              Generar Todas
            </Button>
          )}

          {/* Export Button - Disabled until all complete */}
          <div className="flex-1" />
          <Button
            variant="outline"
            disabled={!isAllComplete}
            title={!isAllComplete ? 'Genera todas las escenas primero' : undefined}
          >
            {isAllComplete ? 'Exportar Video' : 'Completar para exportar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
