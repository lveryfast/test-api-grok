import { z } from 'zod';

/**
 * Validate base64 image string
 * Must start with "data:image/" and be valid base64
 */
const base64ImageRegex = /^data:image\/(png|jpeg|jpg|gif|webp);base64,[A-Za-z0-9+/=]+$/;

function isValidBase64Image(value: string): boolean {
  if (!value) return true; // Empty is allowed (optional field)
  return base64ImageRegex.test(value);
}

/**
 * Zod schema for video generation request validation
 */
export const VideoGenerationSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(10000, 'Prompt too long'),
  image: z.string()
    .optional()
    .refine(
      (val) => isValidBase64Image(val || ''),
      { message: 'Image must be a valid base64 data URL (data:image/png;base64,...)' }
    ),
  sceneNumber: z.number().int().positive().optional().default(1),
});

export type VideoGenerationInput = z.infer<typeof VideoGenerationSchema>;
