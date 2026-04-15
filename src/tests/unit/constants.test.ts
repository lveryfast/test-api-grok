import { describe, it, expect } from 'vitest';
import {
  CHARACTER_LIMITS,
  VIDEO_STYLES,
  SCENE_COUNTS,
} from '@/types/constants';

describe('constants', () => {
  describe('CHARACTER_LIMITS', () => {
    it('should have correct limits defined', () => {
      expect(CHARACTER_LIMITS.SCRIPT).toBe(5000);
      expect(CHARACTER_LIMITS.CHARACTER_PROMPT).toBe(1000);
      expect(CHARACTER_LIMITS.VOICE_PROMPT).toBe(500);
      expect(CHARACTER_LIMITS.SCENE_DIALOGUE).toBe(300);
      expect(CHARACTER_LIMITS.SCENE_DESCRIPTION).toBe(400);
      expect(CHARACTER_LIMITS.CUSTOM_STYLE_DESCRIPTION).toBe(200);
    });

    it('should have all required fields', () => {
      expect(CHARACTER_LIMITS).toHaveProperty('SCRIPT');
      expect(CHARACTER_LIMITS).toHaveProperty('CHARACTER_PROMPT');
      expect(CHARACTER_LIMITS).toHaveProperty('VOICE_PROMPT');
      expect(CHARACTER_LIMITS).toHaveProperty('SCENE_DIALOGUE');
      expect(CHARACTER_LIMITS).toHaveProperty('SCENE_DESCRIPTION');
      expect(CHARACTER_LIMITS).toHaveProperty('CUSTOM_STYLE_DESCRIPTION');
    });

    it('should have reasonable values', () => {
      expect(CHARACTER_LIMITS.SCRIPT).toBeGreaterThan(0);
      expect(CHARACTER_LIMITS.CHARACTER_PROMPT).toBeGreaterThan(0);
      expect(CHARACTER_LIMITS.VOICE_PROMPT).toBeGreaterThan(0);
      expect(CHARACTER_LIMITS.SCENE_DIALOGUE).toBeGreaterThan(0);
      expect(CHARACTER_LIMITS.SCENE_DESCRIPTION).toBeGreaterThan(0);
    });

    it('should have script with highest limit', () => {
      expect(CHARACTER_LIMITS.SCRIPT).toBeGreaterThan(CHARACTER_LIMITS.CHARACTER_PROMPT);
      expect(CHARACTER_LIMITS.SCRIPT).toBeGreaterThan(CHARACTER_LIMITS.VOICE_PROMPT);
    });
  });

  describe('VIDEO_STYLES', () => {
    it('should have exactly 12 predefined styles', () => {
      expect(VIDEO_STYLES).toHaveLength(12);
    });

    it('should have all required style properties', () => {
      VIDEO_STYLES.forEach((style) => {
        expect(style).toHaveProperty('id');
        expect(style).toHaveProperty('title');
        expect(style).toHaveProperty('description');
        expect(style).toHaveProperty('isCustom');
      });
    });

    it('should all be non-custom styles', () => {
      VIDEO_STYLES.forEach((style) => {
        expect(style.isCustom).toBe(false);
      });
    });

    it('should have unique IDs', () => {
      const ids = VIDEO_STYLES.map((style) => style.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have non-empty titles and descriptions', () => {
      VIDEO_STYLES.forEach((style) => {
        expect(style.title.trim()).not.toBe('');
        expect(style.description.trim()).not.toBe('');
      });
    });

    it('should include expected styles', () => {
      const styleIds = VIDEO_STYLES.map((style) => style.id);
      
      expect(styleIds).toContain('pixar');
      expect(styleIds).toContain('ghibli');
      expect(styleIds).toContain('dreamworks');
      expect(styleIds).toContain('marvel');
      expect(styleIds).toContain('minecraft');
      expect(styleIds).toContain('realista');
    });
  });

  describe('SCENE_COUNTS', () => {
    it('should have correct values', () => {
      expect(SCENE_COUNTS).toEqual([2, 4, 6, 8, 10, 12, 14]);
    });

    it('should have 7 options', () => {
      expect(SCENE_COUNTS).toHaveLength(7);
    });

    it('should be even numbers', () => {
      SCENE_COUNTS.forEach((count) => {
        expect(count % 2).toBe(0);
      });
    });

    it('should start with minimum of 2', () => {
      expect(SCENE_COUNTS[0]).toBe(2);
    });

    it('should end with maximum of 14', () => {
      expect(SCENE_COUNTS[SCENE_COUNTS.length - 1]).toBe(14);
    });

    it('should have consistent increments', () => {
      for (let i = 1; i < SCENE_COUNTS.length; i++) {
        expect(SCENE_COUNTS[i] - SCENE_COUNTS[i - 1]).toBe(2);
      }
    });
  });
});
