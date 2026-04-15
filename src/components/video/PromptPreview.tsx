'use client';

import { useState } from 'react';
import { useVideoStore } from '@/hooks/useVideoStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { buildVideoPrompt, validatePromptComponents, estimateTokens } from '@/lib/prompt-builder';
import { VideoStyle } from '@/types/video';
import { AlertCircle, CheckCircle, Copy, Send } from 'lucide-react';

interface PromptPreviewProps {
  sceneNumber: number;
  isGenerating: boolean;
}

export function PromptPreview({ sceneNumber, isGenerating }: PromptPreviewProps) {
  const {
    script,
    selectedStyle,
    characterPrompt,
    voicePrompt,
    scenes,
    hook,
    generatedVideos,
  } = useVideoStore();

  const [showFullPrompt, setShowFullPrompt] = useState(false);
  const [copied, setCopied] = useState(false);

  // Get previous screenshot if available
  const previousVideo = generatedVideos[generatedVideos.length - 1];
  const previousScreenshot = previousVideo?.screenshotPath;

  // Build prompt components with validation
  const scene = scenes[sceneNumber - 1] || { id: sceneNumber, dialogue: '', description: '' };
  const style: VideoStyle | null = selectedStyle;

  // Check if scene is valid
  const isSceneValid = scene && scene.dialogue !== undefined && scene.description !== undefined;

  const components = {
    script,
    style: style!,
    character: characterPrompt,
    voice: voicePrompt,
    scene,
    hook,
    previousScreenshot,
    sceneNumber,
    totalScenes: scenes.length,
  };

  // Validate
  const validation = style ? validatePromptComponents(components) : { isValid: false, errors: ['Selecciona un estilo'] };

  // Build prompt
  const fullPrompt = style ? buildVideoPrompt(components) : '';
  const estimatedTokens = estimateTokens(fullPrompt);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(fullPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Preview del Prompt - Escena {sceneNumber}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Validation Status */}
        {!validation.isValid && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Completa los campos requeridos:</p>
                <ul className="text-sm text-destructive mt-1 space-y-1">
                  {validation.errors.map((error, i) => (
                    <li key={i}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {validation.isValid && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-sm text-green-700">
                Todo listo. El prompt está preparado para enviarse a Grok.
              </p>
            </div>
          </div>
        )}

        {/* Prompt Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Prompt a enviar ({estimatedTokens} tokens aprox.)</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullPrompt(!showFullPrompt)}
            >
              {showFullPrompt ? 'Ocultar' : 'Ver completo'}
            </Button>
          </div>

          <Textarea
            value={showFullPrompt ? fullPrompt : fullPrompt.slice(0, 500) + '...'}
            readOnly
            className="min-h-[200px] font-mono text-sm bg-muted/50"
          />

          {!showFullPrompt && fullPrompt.length > 500 && (
            <p className="text-sm text-muted-foreground text-right">
              ...y {fullPrompt.length - 500} caracteres más
            </p>
          )}
        </div>

        {/* Previous Screenshot Indicator */}
        {previousScreenshot && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              📷 Se incluirá screenshot de la escena anterior para continuidad visual
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={handleCopyPrompt}
            disabled={!validation.isValid || isGenerating}
          >
            <Copy className="h-4 w-4 mr-2" />
            {copied ? '¡Copiado!' : 'Copiar Prompt'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
