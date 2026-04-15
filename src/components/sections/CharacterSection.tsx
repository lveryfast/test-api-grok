'use client';

import { useVideoStore } from '@/hooks/useVideoStore';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CHARACTER_LIMITS } from '@/types/constants';

export function CharacterSection() {
  const { characterPrompt, setCharacterPrompt } = useVideoStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>3. Construcción de Personaje</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Label htmlFor="character" className="text-muted-foreground">
          Prompt del personaje (máximo {CHARACTER_LIMITS.CHARACTER_PROMPT} caracteres)
        </Label>
        <Textarea
          id="character"
          value={characterPrompt}
          onChange={(e) => setCharacterPrompt(e.target.value)}
          placeholder="Describe las características del personaje principal..."
          className="min-h-[120px] resize-y"
        />
        <div className="text-sm text-muted-foreground text-right">
          {characterPrompt.length.toLocaleString()} / {CHARACTER_LIMITS.CHARACTER_PROMPT.toLocaleString()} caracteres
        </div>
      </CardContent>
    </Card>
  );
}
