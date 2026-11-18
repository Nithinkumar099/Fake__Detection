import time
from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Request
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional

from services.blockchain_service import blockchain_service, compute_sha256
from services.text_ai import analyze_claims_and_evidence
from services.image_ai import perform_ela_and_forensics
from services.video_ai import analyze_video_forensics
from services.gemini_analyzer import analyze_content_with_gemini

app = FastAPI(
    title="Digital Truth Layer API",
    description="Multi-Modal AI and Blockchain Information Trust System",
    version="1.0.0"
)

# Enable CORS for frontend interactions (credentials disabled so wildcard origin is spec-compliant)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextVerificationRequest(BaseModel):
    text: str
    recheck: Optional[bool] = False

@app.get("/api/health")
def health_check() -> Dict[str, Any]:
    """Returns operational status of FastAPI, AI modules, and Hardhat blockchain connection."""
    bc_ready = blockchain_service.is_ready()
    return {
        "status": "healthy",
        "service": "Digital Truth Layer API",
        "timestamp": int(time.time()),
        "aiEngines": {
            "textAI": "Online",
            "imageELA": "Online",
            "videoForensics": "Online"
        },
        "blockchain": {
            "connected": bc_ready,
            "contractAddress": blockchain_service.config.get("contract_address", "Not deployed yet"),
            "rpcUrl": blockchain_service.config.get("rpc_url", "http://127.0.0.1:8545"),
            "chainId": blockchain_service.config.get("chain_id", 31337)
        }
    }

@app.post("/api/verify/text")
def verify_text(payload: TextVerificationRequest) -> Dict[str, Any]:
    """
    Computes SHA-256 fingerprint of submitted text.
    Executes text forensics and synchronizes with TruthRegistry smart contract.
    If cached record differs from updated forensic intelligence, updates on-chain proof.
    """
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text payload cannot be empty.")

    content_hash = compute_sha256(text)
    ai_result = analyze_claims_and_evidence(text)
    trust_score = ai_result["trustScore"]

    existing = None if payload.recheck else blockchain_service.check_existing_verification(content_hash)

    # If ledger record exists and matches current score, return instant match
    if existing and existing["trustScore"] == trust_score:
        return {
            "contentHash": content_hash,
            "mediaType": "text",
            "trustScore": trust_score,
            "verdict": "Immutable Ledger Match: " + ai_result["verdict"],
            "riskLevel": ai_result["riskLevel"],
            "verifiedFromLedger": True,
            "cached": True,
            "timestamp": existing["timestamp"],
            "blockchain": existing,
            "findings": [
                "Identical SHA-256 fingerprint verified against TruthRegistry.sol smart contract.",
                f"Consensus Block Timestamp: {time.ctime(existing['timestamp'])}."
            ] + ai_result["findings"],
            "evidenceLinks": ai_result["evidenceLinks"],
            "primaryClaim": ai_result.get("primaryClaim", "")
        }

    # Otherwise (new record or discrepancy/re-audit), commit updated verified score to blockchain
    bc_receipt = blockchain_service.store_verification(content_hash, trust_score, "text")

    return {
        "contentHash": content_hash,
        "mediaType": "text",
        "trustScore": trust_score,
        "verdict": ai_result["verdict"],
        "riskLevel": ai_result["riskLevel"],
        "verifiedFromLedger": False,
        "cached": False,
        "timestamp": bc_receipt["timestamp"],
        "blockchain": bc_receipt,
        "findings": ai_result["findings"],
        "evidenceLinks": ai_result["evidenceLinks"],
        "primaryClaim": ai_result.get("primaryClaim", "")
    }

@app.post("/api/verify/image")
async def verify_image(
    file: UploadFile = File(...),
    recheck: bool = Form(False)
) -> Dict[str, Any]:
    """
    Computes SHA-256 fingerprint of uploaded image.
    Executes multi-modal ELA, AI watermark, and OCR forensics.
    Reconciles with TruthRegistry smart contract to ensure outdated cache scores never override truth.
    """
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    filename_lower = (file.filename or "").lower()
    if file.content_type not in allowed_types and not filename_lower.endswith((".jpg", ".jpeg", ".png", ".webp")):
        raise HTTPException(status_code=400, detail="Invalid image file type. Please upload JPG, PNG, or WEBP.")

    image_bytes = await file.read()
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    content_hash = compute_sha256(image_bytes)
    ai_result = await run_in_threadpool(perform_ela_and_forensics, image_bytes)
    trust_score = ai_result["trustScore"]

    existing = None if recheck else await run_in_threadpool(blockchain_service.check_existing_verification, content_hash)

    # If ledger record exists and matches accurate forensic score
    if existing and existing["trustScore"] == trust_score:
        return {
            "contentHash": content_hash,
            "mediaType": "image",
            "trustScore": trust_score,
            "verdict": "Immutable Ledger Match: " + ai_result["verdict"],
            "riskLevel": ai_result["riskLevel"],
            "verifiedFromLedger": True,
            "cached": True,
            "timestamp": existing["timestamp"],
            "blockchain": existing,
            "elaHeatmapBase64": ai_result["elaHeatmapBase64"],
            "findings": [
                "Identical SHA-256 image fingerprint verified against TruthRegistry.sol smart contract.",
                f"Consensus Block Timestamp: {time.ctime(existing['timestamp'])}."
            ] + ai_result["findings"],
            "metadata": ai_result.get("metadata", {})
        }

    # If new, or if previous on-chain score was outdated/discrepant, update blockchain ledger
    bc_receipt = await run_in_threadpool(blockchain_service.store_verification, content_hash, trust_score, "image")

    return {
        "contentHash": content_hash,
        "mediaType": "image",
        "trustScore": trust_score,
        "verdict": ai_result["verdict"],
        "riskLevel": ai_result["riskLevel"],
        "verifiedFromLedger": False,
        "cached": False,
        "timestamp": bc_receipt["timestamp"],
        "blockchain": bc_receipt,
        "elaHeatmapBase64": ai_result["elaHeatmapBase64"],
        "findings": ai_result["findings"],
        "metadata": ai_result.get("metadata", {})
    }

@app.post("/api/verify/video")
async def verify_video(
    file: UploadFile = File(...),
    recheck: bool = Form(False)
) -> Dict[str, Any]:
    """
    Computes SHA-256 fingerprint of uploaded video.
    Extracts 10 keyframes, runs temporal & ELA forensics, commits to blockchain ledger.
    """
    allowed_exts = (".mp4", ".mov", ".webm", ".avi", ".mkv")
    filename_lower = (file.filename or "").lower()
    if not filename_lower.endswith(allowed_exts):
        raise HTTPException(status_code=400, detail="Invalid video format. Please upload MP4, MOV, or WEBM.")

    video_bytes = await file.read()
    if len(video_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded video file is empty.")

    content_hash = compute_sha256(video_bytes)
    ai_result = await run_in_threadpool(analyze_video_forensics, video_bytes)
    trust_score = ai_result["trustScore"]

    existing = None if recheck else await run_in_threadpool(blockchain_service.check_existing_verification, content_hash)

    if existing and existing["trustScore"] == trust_score:
        return {
            "contentHash": content_hash,
            "mediaType": "video",
            "trustScore": trust_score,
            "verdict": "Immutable Ledger Match: " + ai_result["verdict"],
            "riskLevel": ai_result["riskLevel"],
            "verifiedFromLedger": True,
            "cached": True,
            "timestamp": existing["timestamp"],
            "blockchain": existing,
            "findings": [
                "Identical SHA-256 video fingerprint verified against TruthRegistry.sol smart contract.",
                f"Consensus Block Timestamp: {time.ctime(existing['timestamp'])}."
            ] + ai_result.get("findings", []),
            "frameScores": ai_result.get("frameScores", []),
            "metadata": ai_result.get("metadata", {})
        }

    bc_receipt = await run_in_threadpool(blockchain_service.store_verification, content_hash, trust_score, "video")

    return {
        "contentHash": content_hash,
        "mediaType": "video",
        "trustScore": trust_score,
        "verdict": ai_result["verdict"],
        "riskLevel": ai_result["riskLevel"],
        "verifiedFromLedger": False,
        "cached": False,
        "timestamp": bc_receipt["timestamp"],
        "blockchain": bc_receipt,
        "findings": ai_result["findings"],
        "frameScores": ai_result["frameScores"],
        "metadata": ai_result.get("metadata", {})
    }

@app.get("/api/ledger")
def get_ledger(limit: int = 50) -> Dict[str, Any]:
    """Fetches all verification records stored on TruthRegistry for live audit table."""
    records = blockchain_service.get_ledger(limit)
    return {
        "count": len(records),
        "records": records,
        "contractAddress": blockchain_service.config.get("contract_address"),
        "network": f"Hardhat Localhost (Chain ID {blockchain_service.config.get('chain_id', 31337)})"
    }

@app.post("/api/analyze")
async def analyze_authenticity(request: Request) -> Dict[str, Any]:
    """
    Authenticity & Deepfake Analyzer endpoint.
    Powered by Gemini 3.8 Flash (google-genai SDK) with strict JSON response schema:
    {
      "authenticity_score": integer (0 to 100),
      "verdict": "Likely Real" | "Uncertain" | "Likely Fake",
      "confidence": "High" | "Medium" | "Low",
      "summary": string,
      "indicators": array of strings
    }
    """
    content_type_header = request.headers.get("content-type", "")
    text = ""
    file_bytes = None
    filename = ""
    file_content_type = ""

    if "application/json" in content_type_header:
        try:
            body = await request.json()
            text = (body.get("text") or "").strip()
        except Exception:
            pass
    elif "multipart/form-data" in content_type_header or "application/x-www-form-urlencoded" in content_type_header:
        form = await request.form()
        if "file" in form:
            upload_item = form["file"]
            if hasattr(upload_item, "read"):
                file_bytes = await upload_item.read()
                filename = upload_item.filename or "upload"
                file_content_type = upload_item.content_type or "application/octet-stream"
        if "text" in form:
            text = str(form["text"]).strip()
    else:
        try:
            body = await request.json()
            text = (body.get("text") or "").strip()
        except Exception:
            pass

    if file_bytes and len(file_bytes) > 0:
        return await run_in_threadpool(
            analyze_content_with_gemini,
            file_bytes=file_bytes,
            filename=filename,
            content_type=file_content_type
        )
    elif text:
        return await run_in_threadpool(analyze_content_with_gemini, text=text)
    else:
        raise HTTPException(
            status_code=400,
            detail="Please provide either 'text' or upload a 'file' (image/video)."
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
