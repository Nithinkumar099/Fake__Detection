import os
import json
import time
import tempfile
from typing import Dict, Any, List, Optional, Literal
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"))

SYSTEM_INSTRUCTION = (
    "You are a forensic media and text authenticity analyst. Evaluate user-submitted text, images, or videos "
    "and estimate the likelihood that the content is authentic and human-created versus synthetic, AI-generated, "
    "or manipulated. For text, check AI phrasing patterns, unnatural cadence, and contradictions. For images, "
    "check lighting, shadows, reflections, hands/eyes/teeth, and background warping. For videos, check "
    "frame-to-frame consistency, lip-sync, facial expressions, and physics anomalies. Score 0–30 as 'Likely Fake', "
    "31–69 as 'Uncertain', and 70–100 as 'Likely Real'. Keep the summary under 2 sentences and provide 2 to 5 "
    "specific observations in the indicators array."
)

class AuthenticityResponse(BaseModel):
    authenticity_score: int = Field(description="Score from 0 to 100", ge=0, le=100)
    verdict: Literal["Likely Real", "Uncertain", "Likely Fake"] = Field(description="Authenticity verdict")
    confidence: Literal["High", "Medium", "Low"] = Field(description="Analysis confidence level")
    summary: str = Field(description="Summary under 2 sentences")
    indicators: List[str] = Field(description="2 to 5 specific observations or red flags")

def get_gemini_client():
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key or api_key == "your_gemini_api_key_here":
        return None
    try:
        from google import genai
        return genai.Client(api_key=api_key)
    except Exception as e:
        print(f"[GeminiAnalyzer] Client initialization error: {e}")
        return None

def fallback_local_analyzer(
    text: Optional[str] = None,
    file_bytes: Optional[bytes] = None,
    filename: Optional[str] = None,
    content_type: Optional[str] = None,
    notice: Optional[str] = None
) -> Dict[str, Any]:
    """
    Intelligent fallback forensic analyzer conforming strictly to the requested JSON schema.
    Active if GEMINI_API_KEY is not configured in .env or when offline.
    """
    from services.text_ai import analyze_claims_and_evidence
    from services.image_ai import perform_ela_and_forensics
    from services.video_ai import analyze_video_forensics

    prefix_notice = f"[{notice}] " if notice else ""

    if text:
        res = analyze_claims_and_evidence(text)
        score = res["trustScore"]
        verdict = "Likely Real" if score >= 70 else ("Uncertain" if score >= 31 else "Likely Fake")
        return {
            "authenticity_score": score,
            "verdict": verdict,
            "confidence": "High" if score >= 80 or score <= 20 else "Medium",
            "summary": f"{prefix_notice}Text evaluated for AI cadence, institutional attribution, and breaking news claim indicators.",
            "indicators": res.get("findings", ["Text cadence evaluated."])[:5]
        }

    if file_bytes and (content_type and "image" in content_type or (filename and filename.lower().endswith((".jpg", ".jpeg", ".png", ".webp")))):
        res = perform_ela_and_forensics(file_bytes)
        score = res["trustScore"]
        verdict = "Likely Real" if score >= 70 else ("Uncertain" if score >= 31 else "Likely Fake")
        return {
            "authenticity_score": score,
            "verdict": verdict,
            "confidence": "High",
            "summary": f"{prefix_notice}Image inspected via Error Level Analysis (ELA), EXIF metadata, and in-image semantic OCR.",
            "indicators": res.get("findings", ["Visual compression profile evaluated."])[:5]
        }

    if file_bytes:
        res = analyze_video_forensics(file_bytes)
        score = res["trustScore"]
        verdict = "Likely Real" if score >= 70 else ("Uncertain" if score >= 31 else "Likely Fake")
        return {
            "authenticity_score": score,
            "verdict": verdict,
            "confidence": "Medium",
            "summary": f"{prefix_notice}Video analyzed across 10 keyframes for temporal consistency and facial blending anomalies.",
            "indicators": res.get("findings", ["Video frame consistency evaluated."])[:5]
        }

    return {
        "authenticity_score": 50,
        "verdict": "Uncertain",
        "confidence": "Low",
        "summary": "No content provided for analysis.",
        "indicators": ["Empty submission."]
    }

def analyze_content_with_gemini(
    text: Optional[str] = None,
    file_bytes: Optional[bytes] = None,
    filename: Optional[str] = None,
    content_type: Optional[str] = None
) -> Dict[str, Any]:
    """
    Submits text, image, or video to Gemini 3.8 Flash using the official Google Gen AI SDK.
    Follows inline data vs Gemini File API rules and enforces exact structured JSON output.
    """
    client = get_gemini_client()
    if not client:
        return fallback_local_analyzer(
            text=text,
            file_bytes=file_bytes,
            filename=filename,
            content_type=content_type,
            notice="Set GEMINI_API_KEY in .env to enable live Gemini 3.8 Flash deep learning analysis."
        )

    from google.genai import types

    config = types.GenerateContentConfig(
        system_instruction=SYSTEM_INSTRUCTION,
        response_mime_type="application/json",
        response_schema=AuthenticityResponse,
        temperature=0.1
    )

    # 1. Plain Text Input
    if text:
        prompt_content = [
            f"Analyze the following text submission for authenticity, human creation versus AI generation, and deception:\n\n{text}"
        ]
        try:
            response = client.models.generate_content(
                model="gemini-3.8-flash",
                contents=prompt_content,
                config=config
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"[GeminiAnalyzer] Text generation error: {e}")
            return fallback_local_analyzer(text=text, notice=f"Gemini API returned: {e}")

    # 2. File Upload (Image or Video)
    if not file_bytes:
        raise ValueError("Either text or a valid file must be provided.")

    is_video = bool(
        (content_type and "video" in content_type) or
        (filename and filename.lower().endswith((".mp4", ".mov", ".webm", ".avi")))
    )
    is_large = len(file_bytes) > 15 * 1024 * 1024  # > 15MB

    # Case A: Small Image (< 15MB) -> Inline data
    if not is_video and not is_large:
        mime = content_type or "image/jpeg"
        if filename:
            if filename.lower().endswith(".png"):
                mime = "image/png"
            elif filename.lower().endswith(".webp"):
                mime = "image/webp"

        image_part = types.Part.from_bytes(
            data=file_bytes,
            mime_type=mime
        )
        prompt = "Analyze this image in detail for photographic authenticity, AI generation (Midjourney, DALL-E, Gemini/Imagen), and deepfake artifacts."

        try:
            response = client.models.generate_content(
                model="gemini-3.8-flash",
                contents=[image_part, prompt],
                config=config
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"[GeminiAnalyzer] Image generation error: {e}")
            return fallback_local_analyzer(file_bytes=file_bytes, filename=filename, content_type=content_type, notice=f"Gemini API returned: {e}")

    # Case B: Video or Large File -> Gemini File API
    ext = os.path.splitext(filename)[1] if filename else (".mp4" if is_video else ".jpg")
    with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp_file:
        tmp_file.write(file_bytes)
        tmp_path = tmp_file.name

    uploaded_gemini_file = None
    try:
        mime = content_type or ("video/mp4" if is_video else "image/jpeg")
        # Upload using the Gemini File API
        uploaded_gemini_file = client.files.upload(
            file=tmp_path,
            config=types.UploadFileConfig(mime_type=mime)
        )

        # Poll until file state is ACTIVE
        timeout_seconds = 90
        start_time = time.time()
        while uploaded_gemini_file.state == "PROCESSING":
            if time.time() - start_time > timeout_seconds:
                raise TimeoutError("Gemini File API processing timed out.")
            time.sleep(2)
            uploaded_gemini_file = client.files.get(name=uploaded_gemini_file.name)

        if uploaded_gemini_file.state != "ACTIVE":
            raise ValueError(f"File upload failed with state: {uploaded_gemini_file.state}")

        prompt = "Perform forensic deepfake and authenticity analysis on this uploaded media file."
        response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=[uploaded_gemini_file, prompt],
            config=config
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"[GeminiAnalyzer] Video File API error: {e}")
        return fallback_local_analyzer(file_bytes=file_bytes, filename=filename, content_type=content_type, notice=f"Gemini API returned: {e}")
    finally:
        # Delete local temp file
        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception:
                pass
        # Delete file from Gemini servers
        if uploaded_gemini_file and client:
            try:
                client.files.delete(name=uploaded_gemini_file.name)
            except Exception as del_err:
                print(f"[GeminiAnalyzer] Cleanup warning: {del_err}")
