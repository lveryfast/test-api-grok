'use client';

import { useVideoStore } from '@/hooks/useVideoStore';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CHARACTER_LIMITS } from '@/types/constants';

export function SceneEditor() {
  const { scenes, updateScene, sceneCount, currentSceneIndex, setCurrentSceneIndex } = useVideoStore();

  const currentScene = scenes[currentSceneIndex - 1] || scenes[0];

  const handlePrevScene = () => {
    if (currentSceneIndex > 1) {
      setCurrentSceneIndex(currentSceneIndex - 1);
    }
  };

  const handleNextScene = () => {
    if (currentSceneIndex < sceneCount) {
      setCurrentSceneIndex(currentSceneIndex + 1);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>6. Editor de Escenas</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevScene}
              disabled={currentSceneIndex <= 1}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-normal min-w-[60px] text-center">
              {currentSceneIndex} / {sceneCount}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextScene}
              disabled={currentSceneIndex >= sceneCount}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Scene Navigation Pills */}
        <div className="flex gap-2 flex-wrap justify-center py-2">
          {scenes.map((scene) => (
            <button
              key={scene.id}
              onClick={() => setCurrentSceneIndex(scene.id)}
              className={`
                w-10 h-10 rounded-full text-sm font-medium transition-all flex items-center justify-center
                ${
                  currentSceneIndex === scene.id
                    ? 'bg-primary text-primary-foreground glow-green scale-110'
                    : scene.dialogue && scene.description
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }
              `}
            >
              {scene.id}
            </button>
          ))}
        </div>

        {/* Scene Editor Fields */}
        {currentScene && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="space-y-2">
              <Label htmlFor={`dialogue-${currentScene.id}`} className="text-foreground">
                Diálogo
                <span className="text-muted-foreground font-normal ml-2">
                  ({currentScene.dialogue.length}/{CHARACTER_LIMITS.SCENE_DIALOGUE})
                </span>
              </Label>
              <Textarea
                id={`dialogue-${currentScene.id}`}
                value={currentScene.dialogue}
                onChange={(e) =>
                  updateScene(currentScene.id, { dialogue: e.target.value })
                }
                placeholder="Escribe lo que dirá el personaje..."
                className="min-h-[100px] bg-muted border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`description-${currentScene.id}`} className="text-foreground">
                Descripción de Escena
                <span className="text-muted-foreground font-normal ml-2">
                  ({currentScene.description.length}/{CHARACTER_LIMITS.SCENE_DESCRIPTION})
                </span>
              </Label>
              <Textarea
                id={`description-${currentScene.id}`}
                value={currentScene.description}
                onChange={(e) =>
                  updateScene(currentScene.id, { description: e.target.value })
                }
                placeholder="Describe visualmente la escena..."
                className="min-h-[100px] bg-muted border-border"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
