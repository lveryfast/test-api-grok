/**
 * Screenshot Extractor - Node.js Implementation
 * 
 * Extracts the last frame from a video file as a PNG image using FFmpeg.
 * No Python required - pure Node.js implementation.
 * 
 * Usage:
 *   node extract_frame.js <input_video> <output_image> [--timestamp SECONDS]
 */

const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

/**
 * Get video duration in seconds
 */
function getVideoDuration(inputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) {
        reject(new Error(`Failed to get video duration: ${err.message}`));
        return;
      }
      const duration = metadata.format.duration;
      resolve(duration);
    });
  });
}

/**
 * Extract a frame from a video
 */
function extractFrame(inputPath, outputPath, timestamp = null) {
  return new Promise((resolve, reject) => {
    const command = ffmpeg(inputPath)
      .outputOptions([
        '-vframes', '1',           // Extract only one frame
        '-q:v', '2',               // Quality (lower is better)
      ])
      .output(outputPath);

    if (timestamp !== null) {
      command.seekInput(timestamp);
    }

    command
      .on('end', () => {
        console.log(`Frame extracted successfully: ${outputPath}`);
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err.message);
        reject(err);
      })
      .run();
  });
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node extract_frame.js <input_video> <output_image> [--timestamp SECONDS]');
    process.exit(1);
  }

  const inputPath = args[0];
  const outputPath = args[1];
  let timestamp = null;

  // Parse optional timestamp
  const timestampIndex = args.indexOf('--timestamp');
  if (timestampIndex !== -1 && args[timestampIndex + 1]) {
    timestamp = parseFloat(args[timestampIndex + 1]);
  }

  // Validate input file exists
  if (!fs.existsSync(inputPath)) {
    // If it's a URL, we can't check local existence
    if (!inputPath.startsWith('http://') && !inputPath.startsWith('https://')) {
      console.error(`Error: Input file not found: ${inputPath}`);
      process.exit(1);
    }
  }

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    // If no timestamp provided, get the last frame
    if (timestamp === null) {
      try {
        const duration = await getVideoDuration(inputPath);
        // Get frame slightly before the end to ensure we have a valid frame
        timestamp = Math.max(0, duration - 0.1);
        console.log(`Video duration: ${duration}s, extracting frame at ${timestamp}s`);
      } catch (err) {
        // If we can't get duration, use a default
        console.warn('Could not get video duration, using default timestamp');
        timestamp = 0;
      }
    }

    await extractFrame(inputPath, outputPath, timestamp);
    process.exit(0);
  } catch (err) {
    console.error('Error extracting frame:', err.message);
    process.exit(1);
  }
}

main();
