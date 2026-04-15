'use client';

import { useVideoStore } from '@/hooks/useVideoStore';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SCENE_COUNTS } from '@/types/constants';

export function SceneSelector() {
  const { sceneCount, setSceneCount } = useVideoStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>5. Número de Escenas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Label className="text-muted-foreground">
          Selecciona cuántas escenas tendrá el video
        </Label>
        <div className="flex flex-wrap gap-2">
          {SCENE_COUNTS.map((count) => (
            <Button
              key={count}
              variant={sceneCount === count ? 'default' : 'outline'}
              onClick={() => setSceneCount(count)}
              className="min-w-[60px]"
            >
              {count}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
