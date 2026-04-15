'use client';

import { useVideoStore } from '@/hooks/useVideoStore';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Anchor } from 'lucide-react';

export function HookSection() {
  const { hook, setHook } = useVideoStore();

  return (
    <Card className="card-hover borderBorder/50 overflow-hidden border-primary/20">
      <CardHeader className="border-b border-border/30 bg-gradient-to-r from-transparent to-primary/10">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20 text-primary animate-pulse-green">
            <Anchor className="h-5 w-5" />
          </div>
          <span>7. Gancho</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <Label htmlFor="hook" className="text-muted-foreground">
          Prompt para la primera escena (el gancho que inicia todo)
        </Label>
        <Textarea
          id="hook"
          value={hook}
          onChange={(e) => setHook(e.target.value)}
          placeholder="Escribe el prompt que Grok usará para generar la primera escena..."
          className="min-h-[120px] resize-y bg-muted/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
        />
        <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border/30">
          💡 Este prompt se utilizará para generar la primera escena. Incluye el contexto inicial y el &quot;gancho&quot; que captará la atención.
        </p>
      </CardContent>
    </Card>
  );
}
