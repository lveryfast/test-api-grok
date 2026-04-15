import { VideoStyle } from './video';

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

export const VIDEO_STYLES: VideoStyle[] = [
  {
    id: 'pixar',
    title: 'Estilo Pixar',
    description:
      'Transformacion al estilo visual Pixar Animation Studios con modelado 3D limpio y suave.',
    isCustom: false,
  },
  {
    id: 'ghibli',
    title: 'Estilo Studio Ghibli',
    description:
      'Ilustración animada tipo pelicula Ghibli con estética nostálgica y poética.',
    isCustom: false,
  },
  {
    id: 'dreamworks',
    title: 'Estilo DreamWorks',
    description:
      'Render 3D cinematográfico con expresiones intensas y dinámicas tipo DreamWorks Animation.',
    isCustom: false,
  },
  {
    id: 'tejido',
    title: 'Estilo Tejido',
    description:
      'Apariencia de crochet/amigurumi con textura de hilo tejido a mano.',
    isCustom: false,
  },
  {
    id: 'marvel',
    title: 'Estilo Marvel',
    description:
      'Ilustración tipo comic cinematográfico con estética de portada Marvel.',
    isCustom: false,
  },
  {
    id: 'anime-chibi',
    title: 'Estilo Anime Chibi',
    description:
      'Versión chibi adorable con proporciones exageradas y estética anime kawaii.',
    isCustom: false,
  },
  {
    id: 'plastilina',
    title: 'Estilo Plastilina',
    description:
      'Apariencia de plastilina modelada a mano con estética claymation/stop-motion.',
    isCustom: false,
  },
  {
    id: 'cartoon',
    title: 'Estilo Cartoon',
    description:
      'Ilustración cartoon caricaturesca con rasgos exagerados y expresivos.',
    isCustom: false,
  },
  {
    id: 'minecraft',
    title: 'Estilo Minecraft',
    description: 'Estetica voxel cubica y pixilada tipo videojuego Minecraft.',
    isCustom: false,
  },
  {
    id: 'lapiz',
    title: 'Estilo Dibujo a Lapiz',
    description:
      'Boceto a lapiz realista hecho a mano con trazos naturales y sombreado suave.',
    isCustom: false,
  },
  {
    id: 'realista',
    title: 'Estilo Realista',
    description:
      'Fotorealismo de alta fidelidad: misma escena y composición con apariencia de fotografía profesional.',
    isCustom: false,
  },
  {
    id: 'objeto-animado',
    title: 'Estilo Objeto Animado',
    description:
      'Objeto convertido en personaje 3D hiperrealista con expresión emocional y render cinematográfico.',
    isCustom: false,
  },
];

export const LOG_FILE_PATH = 'python/logs/api_calls.log';
