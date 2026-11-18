# Digital Truth Layer: AI and Blockchain Based Information Trust System

Digital Truth Layer is a production-grade, multi-modal information verification platform that combines cutting-edge AI forensics with immutable Ethereum blockchain technology. It establishes a tamper-proof chain of custody for digital media (Text, Images, and Video), combating misinformation and synthetic media tampering.

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
                      |          (Port 8000 / Web3.py)        |
                      +---------+-------------------+---------+
                                |                   |
               +----------------+                   +----------------+
               v                                                     v
+-------------------------------+                     +-------------------------------+
|     Hardhat Ethereum Node     |                     |      Multi-Modal AI Engines   |
|     (TruthRegistry.sol: 8545) |                     |   - Text NLP & Fact-Check     |
|   - Content SHA-256 Hashes    |                     |   - Image ELA & EXIF          |
|   - Consensus Timestamp       |                     |   - Video 10-Keyframe Temporal|
+-------------------------------+                     +-------------------------------+
```

### Verification Pipeline:
1. **Cryptographic Fingerprint**: Submissions (raw text or media bytes) are hashed with **SHA-256**.
2. **Blockchain Cache Query**: `TruthRegistry.sol` is queried via Web3.py.
   - If the hash already exists on-chain, the system instantly returns the immutable score, block timestamp, and `verifiedFromLedger: true` (bypassing AI computation).
3. **AI Forensics**: If the asset is new, specialized AI pipelines run:
   - **Text**: Analyzes sensationalism patterns, capitalization anomalies, journalistic attribution, and queries live web evidence sources.
   - **Image**: Executes **Error Level Analysis (ELA)** to detect compression disparities, builds a visual glowing heatmap, and parses EXIF metadata for editing software.
   - **Video**: Samples 10 equidistant keyframes, evaluates temporal jump-cuts, frame-level ELA anomalies, and flicker inconsistency.
4. **On-Chain Settlement**: The computed trust score and metadata are committed to `TruthRegistry.sol` in a signed transaction, producing a permanent `txHash` and block number.

---

## 📁 Repository Structure

```
.
├── blockchain/                # Smart contracts & Hardhat node
│   ├── contracts/             # TruthRegistry.sol
│   ├── scripts/deploy.js      # Automated deployer & config exporter
│   ├── hardhat.config.js      # Port 8545, Chain ID 31337
│   └── package.json
│
├── backend/                   # FastAPI backend & AI services
│   ├── main.py                # REST endpoints (/api/verify/*, /api/ledger, /api/health)
│   ├── contract_config.json   # Auto-exported ABI, address, and deployer keys
│   ├── requirements.txt       # Python dependencies
│   └── services/              # Modular forensics & Web3 bridges
│       ├── blockchain_service.py
│       ├── text_ai.py
│       ├── image_ai.py
│       └── video_ai.py
│
├── frontend/                  # Next.js 14 cyber-trust dashboard
│   ├── app/                   # App Router pages & styles (#0B0F19 obsidian theme)
│   ├── components/            # Studio, Gauges, ELA Heatmap, Receipt, Ledger, Certificate
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
| `POST` | `/api/verify/video` | Accepts multipart video (`.mp4`, `.mov`) |
| `GET` | `/api/ledger` | Returns all records stored on `TruthRegistry.sol` |

---

## 🛡️ Forensic Modules Detail

### 1. Error Level Analysis (ELA)
Digital images lose error information each time they are re-encoded. When an image is spliced, the spliced area has undergone a different number of compressions than the background. The ELA engine re-saves images at a controlled JPEG quality (90%), subtracts pixel values, scales the difference by 15x, and visualizes the high-frequency residue using an inferno colormap.

### 2. Video Temporal & Frame Consistency
Deepfakes and stitched video clips frequently suffer from temporal boundary flicker and abrupt structural discontinuities. The video engine samples 10 evenly spaced keyframes, calculates frame-to-frame pixel variance, checks inter-frame ELA stability, and reports an individual trust score per keyframe.

### 3. Blockchain Immutability
All fingerprints are stored on `TruthRegistry.sol`. Re-verifying previously submitted content returns `verifiedFromLedger: true` in milliseconds, proving that once content has been audited, its cryptographic signature cannot be altered.
