/**
 * Sanitize prompt to prevent injection issues
 */
export function sanitizePrompt(prompt: string): string {
  return prompt
    .trim()
    .slice(0, 10000) // Max length
    .replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters
}
