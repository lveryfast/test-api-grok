import { z } from 'zod';

/**
 * Zod schema for video generation request validation
 */
export const VideoGenerationSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(10000, 'Prompt too long'),
  image: z.string().optional(),
  sceneNumber: z.number().int().positive().optional().default(1),
});

export type VideoGenerationInput = z.infer<typeof VideoGenerationSchema>;
