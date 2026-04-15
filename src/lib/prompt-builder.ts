import { Scene } from '@/types/scene';
import { VideoStyle } from '@/types/video';

export interface PromptComponents {
  script: string;
  style: VideoStyle;
  character: string;
  voice: string;
  scene: Scene;
  hook: string;
  previousScreenshot?: string;
  sceneNumber: number;
  totalScenes: number;
}

/**
 * Build the complete prompt for video generation
 */
export function buildVideoPrompt(components: PromptComponents): string {
  const {
    script,
    style,
    character,
    voice,
    scene,
    hook,
    previousScreenshot,
    sceneNumber,
    totalScenes,
  } = components;

  // Build scene-specific context
  const sceneContext = buildSceneContext(
    scene,
    sceneNumber,
    totalScenes,
    previousScreenshot
  );

  // Build the complete prompt
  const promptParts: string[] = [];

  // Add hook for first scene
  if (sceneNumber === 1 && hook.trim()) {
    promptParts.push(`GANCHO INICIAL:\n${hook.trim()}`);
  }

  // Add context from previous scene if available
  if (previousScreenshot && sceneNumber > 1) {
    promptParts.push(`CONTINUIDAD: Mantén consistencia visual con la escena anterior.`);
  }

  // Add main content
  promptParts.push(`GUIÓN:\n${script}`);
  promptParts.push(`ESTILO VISUAL:\n${style.description}`);
  
  if (character.trim()) {
    promptParts.push(`PERSONAJE:\n${character}`);
  }
  
  if (voice.trim()) {
    promptParts.push(`VOZ:\n${voice}`);
  }

  // Add current scene details
  promptParts.push(`ESCENA ${sceneNumber} DE ${totalScenes}:`);
  promptParts.push(`DIÁLOGO: ${scene.dialogue}`);
  promptParts.push(`DESCRIPCIÓN: ${scene.description}`);

  // Add scene context
  if (sceneContext) {
    promptParts.push(`CONTEXTO ADICIONAL:\n${sceneContext}`);
  }

  // Add scene continuity instructions
  if (sceneNumber > 1) {
    promptParts.push(`INSTRUCCIONES DE CONTINUIDAD:\n- El personaje debe mantener las mismas características visuales.\n- El escenario debe ser consistente con la escena anterior.\n- Mantén el estilo visual de forma consistente.`);
  }

  return promptParts.join('\n\n');
}

/**
 * Build scene context based on position
 */
function buildSceneContext(
  scene: Scene,
  sceneNumber: number,
  totalScenes: number,
  previousScreenshot?: string
): string {
  const contexts: string[] = [];

  // First scene
  if (sceneNumber === 1) {
    contexts.push('Esta es la escena inicial del video.');
    contexts.push('Establece el tono, ambiente y personajes.');
  }

  // Last scene
  if (sceneNumber === totalScenes) {
    contexts.push('Esta es la escena final.');
    contexts.push('Considera un cierre apropiado para el video.');
  }

  // Middle scenes
  if (sceneNumber > 1 && sceneNumber < totalScenes) {
    contexts.push(`Continuación natural desde la escena ${sceneNumber - 1}.`);
    contexts.push('Mantén el flujo narrativo.');
  }

  // If we have a previous screenshot
  if (previousScreenshot) {
    contexts.push('IMPORTANTE: Usa la imagen de referencia para mantener consistencia visual.');
  }

  return contexts.join(' ');
}

/**
 * Estimate prompt token count (rough estimate: ~4 chars per token)
 */
export function estimateTokens(prompt: string): number {
  return Math.ceil(prompt.length / 4);
}

/**
 * Validate prompt components before generation
 */
export function validatePromptComponents(components: PromptComponents): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!components.script.trim()) {
    errors.push('El guión es requerido');
  }

  if (!components.style) {
    errors.push('Debes seleccionar un estilo de video');
  }

  if (!components.scene.dialogue.trim()) {
    errors.push(`El diálogo de la escena ${components.sceneNumber} es requerido`);
  }

  if (!components.scene.description.trim()) {
    errors.push(`La descripción de la escena ${components.sceneNumber} es requerida`);
  }

  if (components.sceneNumber === 1 && !components.hook.trim()) {
    errors.push('El gancho es requerido para la primera escena');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Build a preview of the prompt without full details (for display)
 */
export function buildPromptPreview(components: PromptComponents): string {
  const { style, scene, sceneNumber, totalScenes, previousScreenshot } = components;

  const parts: string[] = [];
  parts.push(`[ESCENA ${sceneNumber}/${totalScenes}]`);
  parts.push(`ESTILO: ${style.title}`);
  
  if (previousScreenshot) {
    parts.push('CONTIENE: Imagen de referencia (continuidad)');
  }
  
  parts.push(`DIÁLOGO: ${scene.dialogue.slice(0, 50)}${scene.dialogue.length > 50 ? '...' : ''}`);
  parts.push(`ESCENA: ${scene.description.slice(0, 50)}${scene.description.length > 50 ? '...' : ''}`);

  return parts.join('\n');
}
