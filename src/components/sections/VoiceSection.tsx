'use client';

import { useVideoStore } from '@/hooks/useVideoStore';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CHARACTER_LIMITS } from '@/types/constants';
import { Mic } from 'lucide-react';

export function VoiceSection() {
  const { voicePrompt, setVoicePrompt } = useVideoStore();

  return (
    <Card className="card-hover borderBorder/50 overflow-hidden">
      <CardHeader className="border-b border-border/30 bg-gradient-to-r from-transparent to-primary/5">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Mic className="h-5 w-5" />
          </div>
          <span>4. Voz</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <Label htmlFor="voice" className="text-muted-foreground">
          Describe las características de la voz del personaje
        </Label>
        <Textarea
          id="voice"
          value={voicePrompt}
          onChange={(e) => setVoicePrompt(e.target.value)}
          placeholder="Ej: Voz grave masculina, tono amigable, habla claro..."
          className="min-h-[100px] resize-y bg-muted/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
        />
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">
            Máximo {CHARACTER_LIMITS.VOICE_PROMPT} caracteres
          </span>
          <span className={`font-mono ${voicePrompt.length > CHARACTER_LIMITS.VOICE_PROMPT * 0.9 ? 'text-amber-500' : 'text-muted-foreground'}`}>
            {voicePrompt.length}/{CHARACTER_LIMITS.VOICE_PROMPT}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
