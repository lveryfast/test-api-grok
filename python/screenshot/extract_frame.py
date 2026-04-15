#!/usr/bin/env python3
"""
Screenshot Extractor for Grok Video API Test

Extracts the last frame from a video file as a PNG image.
Uses FFmpeg for reliable video frame extraction.

Usage:
    python extract_frame.py <input_video> <output_image> [--timestamp SECONDS]

Arguments:
    input_video    Path to the input video file (MP4)
    output_image   Path where the output PNG will be saved
    --timestamp    Optional: Extract frame at specific timestamp (default: last frame)
"""

import argparse
import subprocess
import sys
import os
from pathlib import Path


def get_video_duration(video_path: str) -> float:
    """Get the duration of a video file in seconds."""
    try:
        cmd = [
            'ffprobe',
            '-v', 'error',
            '-show_entries', 'format=duration',
            '-of', 'default=noprint_wrappers=1:nokey=1',
            video_path
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return float(result.stdout.strip())
    except (subprocess.CalledProcessError, ValueError) as e:
        raise RuntimeError(f"Failed to get video duration: {e}")


def extract_frame(video_path: str, output_path: str, timestamp: float = None) -> bool:
    """
    Extract a frame from a video file.
    
    Args:
        video_path: Path to the input video
        output_path: Path where the PNG will be saved
        timestamp: Specific timestamp in seconds (None = last frame)
    
    Returns:
        True if successful, False otherwise
    """
    # Ensure output directory exists
    output_dir = Path(output_path).parent
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # If no timestamp provided, get the last frame
    if timestamp is None:
        try:
            duration = get_video_duration(video_path)
            # Get a frame slightly before the end to ensure we have a valid frame
            timestamp = max(0, duration - 0.1)
        except RuntimeError:
            # Fallback: use 99% of the video duration
            timestamp = -1  # FFmpeg will seek to near the end
    
    # Build FFmpeg command
    cmd = [
        'ffmpeg',
        '-y',  # Overwrite output file
        '-ss', str(timestamp) if timestamp >= 0 else str(get_video_duration(video_path) - 0.1),
        '-i', video_path,
        '-vframes', '1',  # Extract only one frame
        '-q:v', '2',  # Quality (lower is better, 2-3 is good for PNG)
        '-pred', 'mixed',  # Better prediction for P-frame extraction
        output_path
    ]
    
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=True
        )
        print(f"Frame extracted successfully: {output_path}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error extracting frame: {e.stderr}", file=sys.stderr)
        
        # Try alternative method: download video if it's a URL
        if video_path.startswith(('http://', 'https://')):
            return extract_frame_from_url(video_path, output_path)
        
        return False


def extract_frame_from_url(video_url: str, output_path: str) -> bool:
    """
    Download video from URL and extract last frame.
    Requires yt-dlp or similar tool installed.
    """
    import tempfile
    
    print(f"Downloading video from URL: {video_url}")
    
    # Create temp directory
    temp_dir = tempfile.mkdtemp()
    temp_video = os.path.join(temp_dir, 'temp_video.mp4')
    
    try:
        # Try using yt-dlp if available
        cmd = ['yt-dlp', '-o', temp_video, '-q', video_url]
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0 and os.path.exists(temp_video):
            return extract_frame(temp_video, output_path)
        
        # Fallback: try direct download with ffmpeg
        cmd = [
            'ffmpeg',
            '-y',
            '-i', video_url,
            '-c', 'copy',
            '-f', 'mp4',
            temp_video
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0 and os.path.exists(temp_video):
            return extract_frame(temp_video, output_path)
        
        print("Failed to download video", file=sys.stderr)
        return False
        
    finally:
        # Cleanup temp directory
        import shutil
        shutil.rmtree(temp_dir, ignore_errors=True)


def main():
    parser = argparse.ArgumentParser(
        description='Extract a frame from a video file as PNG'
    )
    parser.add_argument(
        'input_video',
        help='Path to the input video file'
    )
    parser.add_argument(
        'output_image',
        help='Path where the output PNG will be saved'
    )
    parser.add_argument(
        '--timestamp', '-t',
        type=float,
        default=None,
        help='Timestamp in seconds to extract frame (default: last frame)'
    )
    
    args = parser.parse_args()
    
    if not os.path.exists(args.input_video) and not args.input_video.startswith(('http://', 'https://')):
        print(f"Error: Input video not found: {args.input_video}", file=sys.stderr)
        sys.exit(1)
    
    success = extract_frame(args.input_video, args.output_image, args.timestamp)
    
    if not success:
        print("Failed to extract frame", file=sys.stderr)
        sys.exit(1)
    
    sys.exit(0)


if __name__ == '__main__':
    main()
