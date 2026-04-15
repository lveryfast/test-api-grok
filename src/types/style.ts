/**
 * Predefined video styles with their prompts
 */
export interface VideoStyle {
  id: string;
  title: string;
  description: string;
  prompt: string;
  isCustom: boolean;
}

/**
 * Custom style created by user
 */
export interface CustomStyle {
  id: string;
  title: string;
  description: string;
  prompt: string;
}

/**
 * Available scene count options
 */
export const SCENE_COUNT_OPTIONS = [2, 4, 6, 8, 10, 12, 14] as const;

/**
 * Predefined video styles
 */
export const PREDEFINED_STYLES: VideoStyle[] = [
  {
    id: 'pixar',
    title: 'Estilo Pixar',
    description:
      'Transformacion al estilo visual Pixar Animation Studios con modelado 3D limpio y suave.',
    prompt:
      'Transformacion al estilo visual Pixar Animation Studios con modelado 3D limpio y suave.',
    isCustom: false,
  },
  {
    id: 'ghibli',
    title: 'Estilo Studio Ghibli',
    description:
      'Ilustración animada tipo pelicula Ghibli con estética nostálgica y poética.',
    prompt:
      'Ilustración animada tipo pelicula Ghibli con estética nostálgica y poética.',
    isCustom: false,
  },
  {
    id: 'dreamworks',
    title: 'Estilo DreamWorks',
    description:
      'Render 3D cinematográfico con expresiones intensas y dinámicas tipo DreamWorks Animation.',
    prompt:
      'Render 3D cinematográfico con expresiones intensas y dinámicas tipo DreamWorks Animation.',
    isCustom: false,
  },
  {
    id: 'tejido',
    title: 'Estilo Tejido',
    description:
      'Apariencia de crochet/amigurumi con textura de hilo tejido a mano.',
    prompt:
      'Apariencia de crochet/amigurumi con textura de hilo tejido a mano.',
    isCustom: false,
  },
  {
    id: 'marvel',
    title: 'Estilo Marvel',
    description: 'Ilustración tipo comic cinematográfico con estética de portada Marvel.',
    prompt: 'Ilustración tipo comic cinematográfico con estética de portada Marvel.',
    isCustom: false,
  },
  {
    id: 'anime-chibi',
    title: 'Estilo Anime Chibi',
    description:
      'Versión chibi adorable con proporciones exageradas y estética anime kawaii.',
    prompt:
      'Versión chibi adorable con proporciones exageradas y estética anime kawaii.',
    isCustom: false,
  },
  {
    id: 'plastilina',
    title: 'Estilo Plastilina',
    description:
      'Apariencia de plastilina modelada a mano con estética claymation/stop-motion.',
    prompt:
      'Apariencia de plastilina modelada a mano con estética claymation/stop-motion.',
    isCustom: false,
  },
  {
    id: 'cartoon',
    title: 'Estilo Cartoon',
    description:
      'Ilustración cartoon caricaturesca con rasgos exagerados y expresivos.',
    prompt: 'Ilustración cartoon caricaturesca con rasgos exagerados y expresivos.',
    isCustom: false,
  },
  {
    id: 'minecraft',
    title: 'Estilo Minecraft',
    description: 'Estetica voxel cubica y pixilada tipo videojuego Minecraft.',
    prompt: 'Estetica voxel cubica y pixilada tipo videojuego Minecraft.',
    isCustom: false,
  },
  {
    id: 'dibujo-lapiz',
    title: 'Estilo Dibujo a Lapiz',
    description:
      'Boceto a lapiz realista hecho a mano con trazos naturales y sombreado suave.',
    prompt:
      'Boceto a lapiz realista hecho a mano con trazos naturales y sombreado suave.',
    isCustom: false,
  },
  {
    id: 'realista',
    title: 'Estilo Realista',
    description:
      'Fotorealismo de alta fidelidad: misma escena y composición con apariencia de fotografía profesional.',
    prompt:
      'Fotorealismo de alta fidelidad: misma escena y composición con apariencia de fotografía profesional.',
    isCustom: false,
  },
  {
    id: 'objeto-animado',
    title: 'Estilo Objeto Animado',
    description:
      'Objeto convertido en personaje 3D hiperrealista con expresión emocional y render cinematográfico.',
    prompt:
      'Objeto convertido en personaje 3D hiperrealista con expresión emocional y render cinematográfico.',
    isCustom: false,
  },
];

/**
 * Create a custom style from user input
 */
export function createCustomStyle(
  title: string,
  description: string
): CustomStyle {
  return {
    id: `custom-${Date.now()}`,
    title,
    description,
    prompt: description, // For custom styles, description serves as the prompt
  };
}

/**
 * Get all available styles (predefined + custom)
 */
export function getAllStyles(customStyles: CustomStyle[] = []): VideoStyle[] {
  const customStyleEntries: VideoStyle[] = customStyles.map((style) => ({
    ...style,
    isCustom: true,
  }));
  return [...PREDEFINED_STYLES, ...customStyleEntries];
}
