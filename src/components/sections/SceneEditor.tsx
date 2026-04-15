'use client';

import { useState } from 'react';
import { useVideoStore } from '@/hooks/useVideoStore';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CHARACTER_LIMITS } from '@/types/constants';

export function SceneEditor() {
  const { scenes, updateScene, sceneCount } = useVideoStore();
  const [selectedScene, setSelectedScene] = useState(1);

  const currentScene = scenes.find((s) => s.id === selectedScene) || scenes[0];

  const handlePrevScene = () => {
    if (selectedScene > 1) {
      setSelectedScene(selectedScene - 1);
    }
  };

  const handleNextScene = () => {
    if (selectedScene < sceneCount) {
      setSelectedScene(selectedScene + 1);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>6. Editor de Escenas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Scene Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevScene}
            disabled={selectedScene <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Select
            value={String(selectedScene)}
            onValueChange={(value) => setSelectedScene(Number(value))}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Seleccionar escena" />
            </SelectTrigger>
            <SelectContent>
              {scenes.map((scene) => (
                <SelectItem key={scene.id} value={String(scene.id)}>
                  Escena {scene.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNextScene}
            disabled={selectedScene >= sceneCount}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <span className="text-sm text-muted-foreground ml-2">
            de {sceneCount} escenas
          </span>
        </div>

        {/* Scene Progress Indicator */}
        <div className="flex gap-1 flex-wrap">
          {scenes.map((scene) => (
            <button
              key={scene.id}
              onClick={() => setSelectedScene(scene.id)}
              className={`
                w-8 h-8 rounded-full text-sm font-medium transition-all
                ${
                  selectedScene === scene.id
                    ? 'bg-primary text-primary-foreground'
                    : scene.dialogue && scene.description
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }
              `}
            >
              {scene.id}
            </button>
          ))}
        </div>

        {/* Current Scene Editor */}
        {currentScene && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor={`dialogue-${currentScene.id}`}>
                Diálogo - Escena {currentScene.id}
                <span className="text-muted-foreground font-normal ml-2">
                  ({CHARACTER_LIMITS.SCENE_DIALOGUE} máx)
                </span>
              </Label>
              <Textarea
                id={`dialogue-${currentScene.id}`}
                value={currentScene.dialogue}
                onChange={(e) =>
                  updateScene(currentScene.id, { dialogue: e.target.value })
                }
                placeholder="Escribe lo que dirá el personaje..."
                className="min-h-[100px]"
              />
              <div className="text-sm text-muted-foreground text-right">
                {currentScene.dialogue.length}/{CHARACTER_LIMITS.SCENE_DIALOGUE}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`description-${currentScene.id}`}>
                Descripción de Escena
                <span className="text-muted-foreground font-normal ml-2">
                  ({CHARACTER_LIMITS.SCENE_DESCRIPTION} máx)
                </span>
              </Label>
              <Textarea
                id={`description-${currentScene.id}`}
                value={currentScene.description}
                onChange={(e) =>
                  updateScene(currentScene.id, { description: e.target.value })
                }
                placeholder="Describe visualmente la escena..."
                className="min-h-[100px]"
              />
              <div className="text-sm text-muted-foreground text-right">
                {currentScene.description.length}/{CHARACTER_LIMITS.SCENE_DESCRIPTION}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
