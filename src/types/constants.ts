import { PREDEFINED_STYLES } from './style';

// Re-export styles from style.ts
export { PREDEFINED_STYLES as VIDEO_STYLES } from './style';

// Character limits and scene counts (still in constants.ts)
export const SCENE_COUNTS = [2, 4, 6, 8, 10, 12, 14] as const;
export type SceneCount = (typeof SCENE_COUNTS)[number];

/**
 * Character limits optimized for cost efficiency
 * Based on Grok API token pricing (~4 chars per token)
 * Optimal: keep prompts concise while maintaining quality
 */
export const CHARACTER_LIMITS = {
  SCRIPT: 5000,          // 1250 tokens - guiones largos están bien
  CHARACTER_PROMPT: 500,  // 125 tokens - descripción concisa del personaje
  VOICE_PROMPT: 300,     // 75 tokens - características de voz
  SCENE_DIALOGUE: 200,   // 50 tokens - diálogos cortos y directos
  SCENE_DESCRIPTION: 300, // 75 tokens - descripción visual concisa
  CUSTOM_STYLE_DESCRIPTION: 150, // 37 tokens - prompts de estilo muy concisos
} as const;

export const LOG_FILE_PATH = 'python/logs/api_calls.log';
