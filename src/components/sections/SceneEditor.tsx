'use client';

import { useVideoStore } from '@/hooks/useVideoStore';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CHARACTER_LIMITS } from '@/types/constants';

export function SceneEditor() {
  const { scenes, updateScene, sceneCount } = useVideoStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>6. Editor de Escenas</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="1" className="w-full">
          <TabsList className="w-full flex flex-wrap h-auto">
            {Array.from({ length: sceneCount }, (_, i) => i + 1).map((num) => (
              <TabsTrigger key={num} value={String(num)} className="flex-1 min-w-[60px]">
                Escena {num}
              </TabsTrigger>
            ))}
          </TabsList>

          {scenes.map((scene) => (
            <TabsContent key={scene.id} value={String(scene.id)} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor={`dialogue-${scene.id}`}>
                  Diálogo
                  <span className="text-muted-foreground font-normal ml-2">
                    ({CHARACTER_LIMITS.SCENE_DIALOGUE} máx)
                  </span>
                </Label>
                <Textarea
                  id={`dialogue-${scene.id}`}
                  value={scene.dialogue}
                  onChange={(e) =>
                    updateScene(scene.id, { dialogue: e.target.value })
                  }
                  placeholder="Escribe lo que dirá el personaje..."
                  className="min-h-[100px]"
                />
                <div className="text-sm text-muted-foreground text-right">
                  {scene.dialogue.length}/{CHARACTER_LIMITS.SCENE_DIALOGUE}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`description-${scene.id}`}>
                  Descripción de Escena
                  <span className="text-muted-foreground font-normal ml-2">
                    ({CHARACTER_LIMITS.SCENE_DESCRIPTION} máx)
                  </span>
                </Label>
                <Textarea
                  id={`description-${scene.id}`}
                  value={scene.description}
                  onChange={(e) =>
                    updateScene(scene.id, { description: e.target.value })
                  }
                  placeholder="Describe visualmente la escena..."
                  className="min-h-[100px]"
                />
                <div className="text-sm text-muted-foreground text-right">
                  {scene.description.length}/{CHARACTER_LIMITS.SCENE_DESCRIPTION}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
