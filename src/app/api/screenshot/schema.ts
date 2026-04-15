import { z } from 'zod';

/**
 * Zod schema for screenshot extraction request validation
 */
export const ScreenshotRequestSchema = z.object({
  videoPath: z.string().min(1, 'Video path is required'),
  timestamp: z.number().nonnegative().optional(),
});

export type ScreenshotRequestInput = z.infer<typeof ScreenshotRequestSchema>;
