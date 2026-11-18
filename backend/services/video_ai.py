import os
import tempfile
from typing import Dict, Any, List
import numpy as np
import cv2

def analyze_video_forensics(video_bytes: bytes) -> Dict[str, Any]:
    """
    Extracts 10 evenly spaced keyframes from uploaded video, evaluates frame-to-frame
    temporal consistency, compression stability, and computes per-frame forensic scores.
    """
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp_file:
        tmp_file.write(video_bytes)
        tmp_path = tmp_file.name

    try:
        cap = cv2.VideoCapture(tmp_path)
        if not cap.isOpened():
            return {
                "trustScore": 50,
                "verdict": "Unreadable Format",
                "riskLevel": "Uncertain / Needs Review",
                "findings": ["Could not decode video stream. Ensure file is standard MP4/MOV."],
                "frameScores": []
            }

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = float(cap.get(cv2.CAP_PROP_FPS))
        if fps <= 0 or np.isnan(fps):
            fps = 30.0

        if total_frames < 10:
            frame_indices = list(range(max(1, total_frames)))
        else:
            frame_indices = np.linspace(0, total_frames - 1, 10, dtype=int).tolist()

        frames = []
        for idx in frame_indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
            ret, frame = cap.read()
            if ret and frame is not None:
                frames.append((idx, frame))

        cap.release()

        if not frames:
            return {
                "trustScore": 50,
                "verdict": "Empty Video Stream",
                "riskLevel": "Uncertain / Needs Review",
                "findings": ["Zero valid frames extracted."],
                "frameScores": []
            }

        # Analyze individual keyframes and temporal transitions
        frame_scores = []
        ela_values = []
        findings = []

        prev_gray = None
        temporal_diffs = []

        for order, (f_idx, bgr_frame) in enumerate(frames):
            gray = cv2.cvtColor(bgr_frame, cv2.COLOR_BGR2GRAY)

            # 1. Keyframe ELA approximation using JPEG recompression
            encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 90]
            _, enc_buf = cv2.imencode(".jpg", bgr_frame, encode_param)
            dec_frame = cv2.imdecode(enc_buf, cv2.IMREAD_COLOR)
            diff = cv2.absdiff(bgr_frame, dec_frame)
            mean_diff = float(np.mean(diff))
            ela_values.append(mean_diff)

            # 2. Temporal transition check
            if prev_gray is not None:
                # Resize if needed to ensure equal dimensions
                t_diff = float(np.mean(cv2.absdiff(prev_gray, gray)))
                temporal_diffs.append(t_diff)
            prev_gray = gray

            # Score per frame
            # Normal video frame ELA mean diff is typically 2.0 to 6.0
            # Higher diff indicates re-encoding or synthetic compression
            frame_penalty = 0
            if mean_diff > 12.0:
                frame_penalty += 35
                status = "High Artifacts"
            elif mean_diff > 7.0:
                frame_penalty += 15
                status = "Moderate Artifacts"
            else:
                status = "Stable"

            frame_score = max(20, min(98, int(92 - frame_penalty)))
            timestamp_sec = round(f_idx / fps, 2)

            frame_scores.append({
                "frameNumber": int(f_idx),
                "sampleIndex": order + 1,
                "timestamp": f"{timestamp_sec}s",
                "score": frame_score,
                "status": status,
                "elaAnomaly": round(mean_diff, 2)
            })

        # Temporal flicker & anomaly detection
        mean_temporal = float(np.mean(temporal_diffs)) if temporal_diffs else 0.0
        std_temporal = float(np.std(temporal_diffs)) if temporal_diffs else 0.0
        ela_variance = float(np.std(ela_values)) if ela_values else 0.0

        # Overall score calculation
        base_score = 90
        video_penalties = 0

        if ela_variance > 5.0:
            video_penalties += 35
            findings.append(f"High inter-frame compression variance (std: {ela_variance:.2f}). Suggests spliced footage or inconsistent generative stitching.")
        else:
            findings.append(f"Consistent inter-frame compression profile across 10 sampled keyframes (variance: {ela_variance:.2f}).")

        if std_temporal > 25.0:
            video_penalties += 25
            findings.append("Abrupt unnatural luminance / structural flickering detected between sequential frames.")
        else:
            findings.append("Smooth temporal motion gradient without unnatural deepfake blending flickering.")

        avg_frame_score = int(np.mean([f["score"] for f in frame_scores]))
        trust_score = max(10, min(98, int(avg_frame_score - video_penalties * 0.4)))

        if trust_score >= 70:
            verdict = "Authentic Temporal Stream"
            risk_level = "Authentic / High Trust"
        elif trust_score >= 40:
            verdict = "Uncertain / Inconsistent"
            risk_level = "Uncertain / Needs Review"
        else:
            verdict = "Likely Manipulated / Deepfake"
            risk_level = "High Risk / Manipulated"

        duration_sec = round(total_frames / fps, 2)
        findings.append(f"Extracted 10 keyframes across {duration_sec}s runtime ({total_frames} total frames at {fps:.1f} FPS).")

        return {
            "trustScore": trust_score,
            "verdict": verdict,
            "riskLevel": risk_level,
            "findings": findings,
            "frameScores": frame_scores,
            "metadata": {
                "totalFrames": total_frames,
                "fps": round(fps, 1),
                "durationSec": duration_sec,
                "sampledKeyframes": len(frame_scores)
            }
        }
    finally:
        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception:
                pass
