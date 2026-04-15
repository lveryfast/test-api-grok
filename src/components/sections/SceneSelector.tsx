'use client';

import { useVideoStore } from '@/hooks/useVideoStore';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SCENE_COUNTS } from '@/types/constants';
import { Film } from 'lucide-react';

export function SceneSelector() {
  const { sceneCount, setSceneCount } = useVideoStore();

  return (
    <Card className="card-hover borderBorder/50 overflow-hidden">
      <CardHeader className="border-b border-border/30 bg-gradient-to-r from-transparent to-primary/5">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Film className="h-5 w-5" />
          </div>
          <span>5. Escenas</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <Label className="text-muted-foreground">
          Selecciona cuántas escenas tendrá el video
        </Label>
        <div className="flex flex-wrap gap-2">
          {SCENE_COUNTS.map((count) => (
            <Button
              key={count}
              variant={sceneCount === count ? 'default' : 'outline'}
              onClick={() => setSceneCount(count)}
              className={`
                min-w-[60px] transition-all
                ${sceneCount === count ? 'glow-green scale-105' : 'hover:scale-105'}
              `}
            >
              {count}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
