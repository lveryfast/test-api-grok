'use client';

import { useVideoStore } from '@/hooks/useVideoStore';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CHARACTER_LIMITS } from '@/types/constants';
import { User } from 'lucide-react';

export function CharacterSection() {
  const { characterPrompt, setCharacterPrompt } = useVideoStore();

  return (
    <Card className="card-hover border-border/50 overflow-hidden">
      <CardHeader className="border-b border-border/30 bg-gradient-to-r from-transparent to-primary/5">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <User className="h-5 w-5" />
          </div>
          <span>3. Personaje</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <Label htmlFor="character" className="text-muted-foreground">
          Describe las características del personaje principal
        </Label>
        <Textarea
          id="character"
          value={characterPrompt}
          onChange={(e) => setCharacterPrompt(e.target.value)}
          placeholder="Ej: Un hombre de 40 años con cabello castaño, traje azul..."
          className="min-h-[120px] resize-y bg-muted/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
        />
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">
            Máximo {CHARACTER_LIMITS.CHARACTER_PROMPT} caracteres
          </span>
          <span className={`font-mono ${characterPrompt.length > CHARACTER_LIMITS.CHARACTER_PROMPT * 0.9 ? 'text-amber-500' : 'text-muted-foreground'}`}>
            {characterPrompt.length}/{CHARACTER_LIMITS.CHARACTER_PROMPT}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
