'use client';

import { useVideoStore } from '@/hooks/useVideoStore';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CHARACTER_LIMITS } from '@/types/constants';

export function VoiceSection() {
  const { voicePrompt, setVoicePrompt } = useVideoStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>4. Construcción de Voz</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Label htmlFor="voice" className="text-muted-foreground">
          Prompt de voz (máximo {CHARACTER_LIMITS.VOICE_PROMPT} caracteres)
        </Label>
        <Textarea
          id="voice"
          value={voicePrompt}
          onChange={(e) => setVoicePrompt(e.target.value)}
          placeholder="Describe las características de la voz del personaje..."
          className="min-h-[100px] resize-y"
        />
        <div className="text-sm text-muted-foreground text-right">
          {voicePrompt.length.toLocaleString()} / {CHARACTER_LIMITS.VOICE_PROMPT.toLocaleString()} caracteres
        </div>
      </CardContent>
    </Card>
  );
}
