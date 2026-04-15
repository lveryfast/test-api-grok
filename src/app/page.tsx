'use client';

import { useCallback, useState } from 'react';
import {
  ScriptSection,
  StyleSection,
  CharacterSection,
  VoiceSection,
  SceneSelector,
  SceneEditor,
  HookSection,
} from '@/components/sections';
import { PromptPreview, VideoGenerator } from '@/components/video';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useVideoStore } from '@/hooks/useVideoStore';
import { RefreshCw, Play } from 'lucide-react';

export default function HomePage() {
  const {
    currentSceneIndex,
    setCurrentSceneIndex,
    isGenerating,
    hook,
    generatedVideos,
    scenes,
  } = useVideoStore();

  const [showGenerator, setShowGenerator] = useState(false);

  // Handle screenshot extraction via Python
  const handleScreenshotNeeded = useCallback(async (videoPath: string): Promise<string | null> => {
    try {
      const response = await fetch('/api/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoPath }),
      });

      if (!response.ok) {
        console.error('Screenshot extraction failed');
        return null;
      }

      const data = await response.json();
      return data.screenshotPath || null;
    } catch (error) {
      console.error('Screenshot error:', error);
      return null;
    }
  }, []);

  // Handle prompt confirmation
  const handlePromptConfirm = useCallback((prompt: string, screenshot?: string) => {
    // The VideoGenerator component will handle the actual generation
    console.log('Prompt confirmed:', { promptLength: prompt.length, hasScreenshot: !!screenshot });
  }, []);

  const isLastScene = currentSceneIndex === scenes.length;
  const canShowGenerator = hook.trim() !== '' && generatedVideos.length === 0;

  return (
    <main className="container mx-auto py-8 px-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Grok Video API Test
        </h1>
        <p className="text-muted-foreground">
          Interface for testing Grok video generation with screenshot-based scene continuity
        </p>
      </header>

      {/* Main Form Sections */}
      <div className="max-w-4xl mx-auto space-y-8">
        <ScriptSection />
        <StyleSection />
        <CharacterSection />
        <VoiceSection />
        <SceneSelector />
        <SceneEditor />
        <HookSection />

        {/* Generate Button */}
        {!showGenerator && (
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={() => setShowGenerator(true)}
              disabled={!canShowGenerator || isGenerating}
              className="min-w-[200px]"
            >
              <Play className="h-4 w-4 mr-2" />
              Iniciar Generación
            </Button>
          </div>
        )}

        {/* Generator Section */}
        {showGenerator && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Generación de Videos</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowGenerator(false)}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reiniciar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Revisa el prompt para cada escena antes de generar. El screenshot de la escena anterior
                  se incluirá automáticamente para mantener la continuidad visual.
                </p>

                {/* Scene Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {scenes.map((_, index) => {
                    const sceneNum = index + 1;
                    const isCompleted = generatedVideos.some((v) => v.sceneNumber === sceneNum);
                    const isCurrent = currentSceneIndex === sceneNum;

                    return (
                      <Button
                        key={sceneNum}
                        variant={isCurrent ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentSceneIndex(sceneNum)}
                        disabled={isCompleted || isGenerating}
                        className={isCompleted ? 'bg-green-600 hover:bg-green-700' : ''}
                      >
                        {isCompleted ? '✓ ' : ''}Escena {sceneNum}
                      </Button>
                    );
                  })}
                </div>

                {/* Prompt Preview for Current Scene */}
                <PromptPreview
                  sceneNumber={currentSceneIndex}
                  onConfirm={handlePromptConfirm}
                  isGenerating={isGenerating}
                />
              </CardContent>
            </Card>

            {/* Video Generator Component */}
            <VideoGenerator onScreenshotNeeded={handleScreenshotNeeded} />
          </div>
        )}
      </div>
    </main>
  );
}
