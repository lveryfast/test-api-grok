'use client';

import { useVideoStore } from '@/hooks/useVideoStore';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function HookSection() {
  const { hook, setHook } = useVideoStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>7. Gancho del Video</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Label htmlFor="hook" className="text-muted-foreground">
          Ingresa el prompt del gancho (la primera escena que inicia todo)
        </Label>
        <Textarea
          id="hook"
          value={hook}
          onChange={(e) => setHook(e.target.value)}
          placeholder="Escribe el prompt que Grok usará para generar la primera escena..."
          className="min-h-[120px] resize-y"
        />
        <p className="text-sm text-muted-foreground">
          Este prompt se utilizará para generar la primera escena del video.
          Puedes pegar un prompt generado externamente o escribir uno manualmente.
        </p>
      </CardContent>
    </Card>
  );
}
