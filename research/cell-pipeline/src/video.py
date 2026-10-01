"""Video helper: OpenCV writes MPEG-4 Part 2, which browsers cannot play."""
import subprocess


def to_h264(path):
    """Re-encode a video to H.264 in place. Keeps the original if ffmpeg is unavailable or fails."""
    try:
        import imageio_ffmpeg
    except ImportError:
        return False
    tmp = path.with_name(path.stem + "_h264.mp4")
    r = subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), "-y", "-loglevel", "error", "-i", str(path),
                        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-movflags", "+faststart",
                        str(tmp)])
    if r.returncode != 0:
        tmp.unlink(missing_ok=True)
        return False
    tmp.replace(path)
    return True
