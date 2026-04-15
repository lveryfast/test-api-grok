'use client';

import { useVideoStore } from '@/hooks/useVideoStore';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CHARACTER_LIMITS } from '@/types/constants';
import { FileText } from 'lucide-react';

export function ScriptSection() {
  const { script, setScript } = useVideoStore();

  return (
    <Card className="card-hover border-border/50 overflow-hidden">
      <CardHeader className="border-b border-border/30 bg-gradient-to-r from-transparent to-primary/5">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <span>1. Guión</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <Label htmlFor="script" className="text-muted-foreground">
          Ingresa o pega el guión del video
        </Label>
        <Textarea
          id="script"
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="Pega aquí el guión de tu video..."
          className="min-h-[200px] resize-y bg-muted/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
        />
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">
            Máximo {CHARACTER_LIMITS.SCRIPT.toLocaleString()} caracteres
          </span>
          <span className={`font-mono ${script.length > CHARACTER_LIMITS.SCRIPT * 0.9 ? 'text-amber-500' : 'text-muted-foreground'}`}>
            {script.length.toLocaleString()} / {CHARACTER_LIMITS.SCRIPT.toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
