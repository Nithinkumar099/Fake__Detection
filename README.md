# Digital Truth Layer: AI & Blockchain Information Trust System

**Digital Truth Layer** is a full-stack, multi-modal information verification and deepfake detection platform that combines **AI media forensics**, **Google Gemini 3.8 Flash authenticity analysis**, and an **immutable Ethereum smart contract ledger (`TruthRegistry.sol`)**. It detects misinformation, AI-generated imagery, spliced photos, and manipulated videos across **Text, Image, and Video**, sealing SHA-256 content fingerprints and trust scores on-chain with printable cryptographic verification certificates.

### Key Capabilities
- **Multi-Modal Truth Layer & Blockchain Ledger**: SHA-256 fingerprinting, live Google News RSS corroboration, Error Level Analysis (ELA) heatmaps, EXIF & AI watermark detection, in-image OCR, 10-keyframe video temporal consistency analysis, and immutable on-chain notarization via Hardhat (`TruthRegistry.sol`).
- **Authenticity & Deepfake Analyzer (`/api/analyze`)**: Powered by the official Google Gen AI SDK (`google-genai`, `gemini-3.8-flash`) with strict structured JSON output (inline data for text/images and Gemini File API with automatic server cleanup for videos/large files), plus automatic local forensic fallback.
- **Cyber-Trust Dashboard**: Next.js 14 dark-mode UI with drag-and-drop uploads, animated trust gauges, side-by-side ELA heatmap inspection, live blockchain audit ledger, and printable verification certificates.

---

## 🏛️ Architecture Overview

```
                      +---------------------------------------+
                      |       Next.js 14 Cyber Dashboard      |
                      |          (Port 3000 / Dark Mode)      |
                      +-------------------+-------------------+
                                          |
                                          | REST API / Multipart
                                          v
                      +-------------------+-------------------+
                      |      FastAPI Multi-Modal Backend      |
                      |      (Port 8000 / Ethers Bridge)      |
                      +---------+-------------------+---------+
                                |                   |
               +----------------+                   +----------------+
               v                                                     v
+-------------------------------+                     +-------------------------------+
|     Hardhat Ethereum Node     |                     |      Multi-Modal AI Engines   |
|     (TruthRegistry.sol: 8545) |                     |   - Text NLP & News RSS       |
|   - Content SHA-256 Hashes    |                     |   - Image ELA, EXIF & OCR     |
|   - Consensus Timestamp       |                     |   - Video 10-Keyframe Temporal|
+-------------------------------+                     |   - Gemini 3.8 Deepfake API   |
                                                      +-------------------------------+
```

### Verification Pipeline:
1. **Cryptographic Fingerprint**: Submissions (raw text or media bytes) are hashed with **SHA-256**.
2. **Multi-Modal AI Forensics**:
   - **Text**: Analyzes sensationalism patterns, critical claims, journalistic attribution, and queries live Google News RSS feeds.
   - **Image**: Executes **Error Level Analysis (ELA)** to detect compression disparities, builds a visual glowing heatmap, inspects EXIF metadata, checks AI corner watermarks, and runs in-image OCR.
   - **Video**: Samples 10 equidistant keyframes, evaluates temporal jump-cuts, frame-level ELA anomalies, and flicker inconsistency.
   - **Authenticity & Deepfake Analyzer (`/api/analyze`)**: Uses the official `google-genai` SDK (`gemini-3.8-flash`) with strict JSON schema output (inline data for text/small images, Gemini File API with automatic cleanup for videos/large files), with local forensic fallback when `GEMINI_API_KEY` is not set.
3. **Blockchain Reconciliation & Settlement**: `TruthRegistry.sol` is queried via the Node.js `ethers` bridge (`blockchain/scripts/contract_cli.js`). Matching records return `verifiedFromLedger: true`; new or re-audited records are committed on-chain with a permanent `txHash` and block number.

---

## 📁 Repository Structure

```
.
├── blockchain/                # Smart contracts & Hardhat node
│   ├── contracts/             # TruthRegistry.sol
│   ├── scripts/
│   │   ├── deploy.js          # Automated deployer & config exporter
│   │   └── contract_cli.js    # Node ethers.js RPC bridge for backend
│   ├── hardhat.config.js      # Port 8545, Chain ID 31337
│   └── package.json
│
├── backend/                   # FastAPI backend & AI services
│   ├── main.py                # REST endpoints (/api/verify/*, /api/analyze, /api/ledger, /api/health)
│   ├── requirements.txt       # Python dependencies (FastAPI, OpenCV, Pillow, google-genai)
│   └── services/              # Modular forensics & blockchain bridges
│       ├── blockchain_service.py
│       ├── gemini_analyzer.py # Gemini 3.8 Flash structured authenticity analyzer
│       ├── text_ai.py
│       ├── image_ai.py
│       ├── ocr_extract.ps1
│       └── video_ai.py
│
├── frontend/                  # Next.js 14 cyber-trust dashboard
│   ├── app/                   # App Router pages, /api/analyze proxy & styles (#0B0F19 obsidian theme)
│   │   └── components/        # Studio, DeepfakeAnalyzer, Gauges, ELA Heatmap, Receipt, Ledger, Certificate
│   └── public/samples/        # Realistic demo files for one-click testing
│
├── demo_samples/              # Test cases generator and sample assets
│   ├── generate_samples.py    # Python synthesizer for authentic & forged assets
│   ├── authentic_news.txt     # Authentic scientific reporting
│   ├── fake_news.txt          # Spliced clickbait conspiracy text
│   ├── original_photo.jpg     # Untampered photographic sample
│   ├── tampered_photo.jpg     # Spliced photo with highlighted ELA diff
│   └── sample_video.mp4       # 10-keyframe temporal test video
│
├── start.bat                  # Windows 1-click startup script
├── start.sh                   # Linux/macOS 1-click startup script
└── README.md
```

---

## ⚡ Quickstart Guide

### Prerequisites:
- **Node.js** (v18+)
- **Python** (v3.10+)

### One-Click Startup:
- **Windows**:
  ```cmd
  start.bat
  ```
- **macOS / Linux**:
  ```bash
  chmod +x start.sh
  ./start.sh
  ```

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Status of FastAPI, AI modules, and Hardhat node |
| `POST` | `/api/verify/text` | Accepts JSON `{"text": "..."}` |
| `POST` | `/api/verify/image` | Accepts multipart image (`.jpg`, `.png`, `.webp`) |
| `POST` | `/api/verify/video` | Accepts multipart video (`.mp4`, `.mov`, `.webm`) |
| `POST` | `/api/analyze` | Authenticity & Deepfake Analyzer (Gemini 3.8 Flash; JSON text or multipart image/video) |
| `GET` | `/api/ledger` | Returns all records stored on `TruthRegistry.sol` |

> **Gemini API Setup:** Copy `.env.example` to `.env` and set `GEMINI_API_KEY` to enable live `gemini-3.8-flash` analysis.

---

## 🛡️ Forensic Modules Detail

### 1. Error Level Analysis (ELA)
Digital images lose error information each time they are re-encoded. When an image is spliced, the spliced area has undergone a different number of compressions than the background. The ELA engine re-saves images at a controlled JPEG quality (90%), subtracts pixel values, scales the difference by 15x, and visualizes the high-frequency residue using an inferno colormap.

### 2. Video Temporal & Frame Consistency
Deepfakes and stitched video clips frequently suffer from temporal boundary flicker and abrupt structural discontinuities. The video engine samples 10 evenly spaced keyframes, calculates frame-to-frame pixel variance, checks inter-frame ELA stability, and reports an individual trust score per keyframe.

### 3. Blockchain Immutability
All fingerprints are stored on `TruthRegistry.sol`. Re-verifying previously submitted content returns `verifiedFromLedger: true` in milliseconds, proving that once content has been audited, its cryptographic signature cannot be altered.
