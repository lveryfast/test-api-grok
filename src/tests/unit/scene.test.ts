import { describe, it, expect } from 'vitest';
import { createEmptyScene, validateScene } from '@/types/scene';

describe('scene types', () => {
  describe('createEmptyScene', () => {
    it('should create scene with correct id', () => {
      const scene = createEmptyScene(5);
      expect(scene.id).toBe(5);
    });

    it('should create scene with empty dialogue', () => {
      const scene = createEmptyScene(1);
      expect(scene.dialogue).toBe('');
    });

    it('should create scene with empty description', () => {
      const scene = createEmptyScene(1);
      expect(scene.description).toBe('');
    });
  });

  describe('validateScene', () => {
    it('should return valid for complete scene', () => {
      const scene = createEmptyScene(1);
      scene.dialogue = 'Test dialogue';
      scene.description = 'Test description';

      const result = validateScene(scene);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return error for empty dialogue', () => {
      const scene = createEmptyScene(1);
      scene.dialogue = '';
      scene.description = 'Test description';

      const result = validateScene(scene);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('El diálogo es requerido');
    });

    it('should return error for empty description', () => {
      const scene = createEmptyScene(1);
      scene.dialogue = 'Test dialogue';
      scene.description = '';

      const result = validateScene(scene);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('La descripción de escena es requerida');
    });

    it('should return error for whitespace-only dialogue', () => {
      const scene = createEmptyScene(1);
      scene.dialogue = '   ';
      scene.description = 'Test description';

      const result = validateScene(scene);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('El diálogo es requerido');
    });

    it('should return error for whitespace-only description', () => {
      const scene = createEmptyScene(1);
      scene.dialogue = 'Test dialogue';
      scene.description = '   ';

      const result = validateScene(scene);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('La descripción de escena es requerida');
    });

    it('should return multiple errors for multiple issues', () => {
      const scene = createEmptyScene(1);
      scene.dialogue = '';
      scene.description = '';

      const result = validateScene(scene);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBe(2);
    });
  });
});
