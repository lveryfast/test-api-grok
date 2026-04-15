import { describe, it, expect } from 'vitest';
import {
  buildVideoPrompt,
  validatePromptComponents,
  estimateTokens,
  buildPromptPreview,
  PromptComponents,
} from '@/lib/prompt-builder';
import { VideoStyle } from '@/types/video';

describe('prompt-builder', () => {
  const mockStyle: VideoStyle = {
    id: 'pixar',
    title: 'Estilo Pixar',
    description: 'Modelado 3D limpio y suave',
    isCustom: false,
  };

  const createMockComponents = (overrides?: Partial<PromptComponents>): PromptComponents => ({
    script: 'Este es un guión de prueba',
    style: mockStyle,
    character: 'Un personaje principal',
    voice: 'Voz amigable',
    scene: {
      id: 1,
      dialogue: 'Hola mundo',
      description: 'Una escena bonita',
    },
    hook: 'El gancho inicial',
    sceneNumber: 1,
    totalScenes: 4,
    ...overrides,
  });

  describe('buildVideoPrompt', () => {
    it('should build prompt with all components for first scene', () => {
      const components = createMockComponents();
      const prompt = buildVideoPrompt(components);

      expect(prompt).toContain('GANCHO INICIAL');
      expect(prompt).toContain('Este es un guión de prueba');
      expect(prompt).toContain('ESTILO VISUAL');
      expect(prompt).toContain('Modelado 3D limpio y suave');
      expect(prompt).toContain('Un personaje principal');
      expect(prompt).toContain('Voz amigable');
      expect(prompt).toContain('ESCENA 1 DE 4');
      expect(prompt).toContain('Hola mundo');
      expect(prompt).toContain('Una escena bonita');
    });

    it('should include continuity instructions for scenes after first', () => {
      const components = createMockComponents({
        sceneNumber: 2,
        previousScreenshot: '/path/to/screenshot.png',
      });
      const prompt = buildVideoPrompt(components);

      expect(prompt).toContain('CONTINUIDAD');
      expect(prompt).toContain('mantener consistencia visual');
      expect(prompt).not.toContain('GANCHO INICIAL');
    });

    it('should not include character if empty', () => {
      const components = createMockComponents({ character: '' });
      const prompt = buildVideoPrompt(components);

      expect(prompt).not.toContain('PERSONAJE');
    });

    it('should not include voice if empty', () => {
      const components = createMockComponents({ voice: '' });
      const prompt = buildVideoPrompt(components);

      expect(prompt).not.toContain('VOZ');
    });
  });

  describe('estimateTokens', () => {
    it('should estimate tokens correctly', () => {
      const prompt = 'a'.repeat(100);
      const tokens = estimateTokens(prompt);

      expect(tokens).toBe(25); // 100 / 4 = 25
    });

    it('should round up to nearest integer', () => {
      const prompt = 'a'.repeat(101);
      const tokens = estimateTokens(prompt);

      expect(tokens).toBe(26); // ceil(101 / 4) = 26
    });

    it('should return 0 for empty string', () => {
      const tokens = estimateTokens('');

      expect(tokens).toBe(0);
    });
  });

  describe('validatePromptComponents', () => {
    it('should return valid for complete components', () => {
      const components = createMockComponents();
      const result = validatePromptComponents(components);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return error if script is empty', () => {
      const components = createMockComponents({ script: '' });
      const result = validatePromptComponents(components);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('El guión es requerido');
    });

    it('should return error if dialogue is empty', () => {
      const components = createMockComponents({
        scene: { id: 1, dialogue: '', description: 'desc' },
      });
      const result = validatePromptComponents(components);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('El diálogo de la escena 1 es requerido');
    });

    it('should return error if description is empty', () => {
      const components = createMockComponents({
        scene: { id: 1, dialogue: 'dialog', description: '' },
      });
      const result = validatePromptComponents(components);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('La descripción de la escena 1 es requerida');
    });

    it('should return error if hook is empty for first scene', () => {
      const components = createMockComponents({ hook: '' });
      const result = validatePromptComponents(components);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('El gancho es requerido para la primera escena');
    });

    it('should not require hook for scenes after first', () => {
      const components = createMockComponents({
        hook: '',
        sceneNumber: 2,
      });
      const result = validatePromptComponents(components);

      expect(result.isValid).toBe(true);
    });

    it('should return multiple errors for multiple missing fields', () => {
      const components = createMockComponents({
        script: '',
        scene: { id: 1, dialogue: '', description: '' },
        hook: '',
      });
      const result = validatePromptComponents(components);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('buildPromptPreview', () => {
    it('should show truncated dialogue', () => {
      const components = createMockComponents({
        scene: {
          id: 1,
          dialogue: 'A'.repeat(100),
          description: 'B'.repeat(100),
        },
      });
      const preview = buildPromptPreview(components);

      expect(preview).toContain('[ESCENA 1/4]');
      expect(preview).toContain('ESTILO: Estilo Pixar');
      expect(preview).toContain('A'.repeat(50));
      expect(preview).toContain('...');
    });

    it('should indicate when screenshot is included', () => {
      const components = createMockComponents({
        previousScreenshot: '/path/to/screenshot.png',
      });
      const preview = buildPromptPreview(components);

      expect(preview).toContain('CONTIENE: Imagen de referencia');
    });
  });
});
