'use client';

import { useVideoStore } from '@/hooks/useVideoStore';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CHARACTER_LIMITS } from '@/types/constants';

export function ScriptSection() {
  const { script, setScript } = useVideoStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>1. Guión</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Label htmlFor="script" className="text-muted-foreground">
          Ingresa o pega el guión del video (máximo {CHARACTER_LIMITS.SCRIPT.toLocaleString()} caracteres)
        </Label>
        <Textarea
          id="script"
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="Pega aquí el guión de tu video..."
          className="min-h-[200px] resize-y"
        />
        <div className="text-sm text-muted-foreground text-right">
          {script.length.toLocaleString()} / {CHARACTER_LIMITS.SCRIPT.toLocaleString()} caracteres
        </div>
      </CardContent>
    </Card>
  );
}
