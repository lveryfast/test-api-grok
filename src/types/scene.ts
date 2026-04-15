/**
 * Scene data structure
 */
export interface Scene {
  id: number;
  dialogue: string;
  description: string;
}

/**
 * Create an empty scene
 */
export function createEmptyScene(id: number): Scene {
  return {
    id,
    dialogue: '',
    description: '',
  };
}

/**
 * Validate scene data
 */
export function validateScene(scene: Scene): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!scene.dialogue.trim()) {
    errors.push('El diálogo es requerido');
  }

  if (!scene.description.trim()) {
    errors.push('La descripción de escena es requerida');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
