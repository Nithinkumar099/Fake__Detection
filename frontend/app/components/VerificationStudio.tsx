"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FileText,
  Image as ImageIcon,
  Video,
  UploadCloud,
  Sparkles,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export type MediaTab = "text" | "image" | "video";

interface VerificationStudioProps {
  onStartVerification: (step: number) => void;
  onVerificationComplete: (result: any, previewUrl?: string) => void;
  onError: (errorMsg: string) => void;
  isLoading: boolean;
}

// Built-in Demo Samples content for instant 1-click evaluation
const DEMO_SAMPLES = {
  authenticText:
    "According to a peer-reviewed study published by researchers at Cambridge University and reported by Reuters, new advancements in solid-state lithium battery chemistry have demonstrated a 40 percent improvement in energy density over conventional electrolyte configurations. Spokespersons for the international materials consortium confirmed that laboratory testing was validated through standardized cyclical stress evaluations across 1,000 thermal cycles. Findings were corroborated by the Department of Energy materials laboratory.",
  fakeText:
    "SHOCKING SECRET EXPOSED! BIG PHARMA DOESN'T WANT YOU TO KNOW THIS FORBIDDEN TRUTH! A miracle cure using common lemon water and magnetic frequency waves has been 100% PROVEN to instantly cure all illnesses! Government deep state agencies have CENSORED this unbelievable breakthrough to protect hospital profits! What happens next will blow your mind! WAKE UP SHEEPLE before this hidden broadcast is completely banned by corrupt doctors!!!",
};

export default function VerificationStudio({
  onStartVerification,
  onVerificationComplete,
  onError,
  isLoading,
}: VerificationStudioProps) {
  const [activeTab, setActiveTab] = useState<MediaTab>("text");

  // Text Tab State
  const [textContent, setTextContent] = useState("");

  // Image Tab State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Video Tab State
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Track pipeline animation timers so they can be cancelled on error/completion
  const stepTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearStepTimers = () => {
    stepTimersRef.current.forEach((t) => clearTimeout(t));
    stepTimersRef.current = [];
  };

  useEffect(() => {
    return () => {
      clearStepTimers();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
  }, [videoPreview]);

  // Re-audit toggle to bypass previous cache
  const [forceRecheck, setForceRecheck] = useState(false);

  // --- Handlers for Text ---
  const handleLoadSampleText = (type: "authentic" | "fake") => {
    if (type === "authentic") {
      setTextContent(DEMO_SAMPLES.authenticText);
    } else {
      setTextContent(DEMO_SAMPLES.fakeText);
    }
  };

  const handleVerifyText = async () => {
    if (!textContent.trim()) {
      onError("Please enter or load text to verify.");
      return;
    }

    try {
      clearStepTimers();
      onStartVerification(1);
      // Simulate pipeline progression
      stepTimersRef.current.push(setTimeout(() => onStartVerification(2), 300));
      stepTimersRef.current.push(setTimeout(() => onStartVerification(3), 600));

      const res = await fetch(`${API_BASE}/api/verify/text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textContent, recheck: forceRecheck }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Verification failed");
      }

      clearStepTimers();
      onStartVerification(4);
      const data = await res.json();
      stepTimersRef.current.push(
        setTimeout(() => {
          onVerificationComplete(data);
        }, 400)
      );
    } catch (e: any) {
      clearStepTimers();
      onError(e.message || "Failed to connect to verification server.");
    }
  };

  // --- Handlers for Image ---
  const handleImageFileChange = (file: File) => {
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingImage(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") && !/\.(jpg|jpeg|png|webp)$/i.test(file.name)) {
      onError("Please drop a valid image file (JPG, PNG, WEBP).");
      return;
    }
    handleImageFileChange(file);
  };

  const handleLoadSampleImage = async (type: "authentic" | "tampered") => {
    try {
      const fileName = type === "authentic" ? "original_photo.jpg" : "tampered_photo.jpg";
      // Fetch synthetic sample directly from backend or fallback to synthetic blob
      const res = await fetch(`/samples/${fileName}`).catch(() => null);
      if (res && res.ok) {
        const blob = await res.blob();
        const file = new File([blob], fileName, { type: "image/jpeg" });
        handleImageFileChange(file);
      } else {
        // Generate SVG-based image blob for instant offline testing
        const canvas = document.createElement("canvas");
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = type === "authentic" ? "#14253d" : "#2a1520";
        ctx.fillRect(0, 0, 640, 480);
        ctx.fillStyle = type === "authentic" ? "#10B981" : "#F43F5E";
        ctx.beginPath();
        ctx.arc(320, 240, 80, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 20px Inter, sans-serif";
        ctx.fillText(type === "authentic" ? "Authentic Camera Sample" : "TAMPERED / SPLICED PATCH", 140, 245);

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], fileName, { type: "image/jpeg" });
            handleImageFileChange(file);
          }
        }, "image/jpeg", type === "authentic" ? 0.95 : 0.65);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyImage = async () => {
    if (!imageFile) {
      onError("Please upload or load an image to verify.");
      return;
    }

    try {
      clearStepTimers();
      onStartVerification(1);
      stepTimersRef.current.push(setTimeout(() => onStartVerification(2), 300));
      stepTimersRef.current.push(setTimeout(() => onStartVerification(3), 700));

      const formData = new FormData();
      formData.append("file", imageFile);
      if (forceRecheck) {
        formData.append("recheck", "true");
      }

      const res = await fetch(`${API_BASE}/api/verify/image`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Image verification failed");
      }

      clearStepTimers();
      onStartVerification(4);
      const data = await res.json();
      stepTimersRef.current.push(
        setTimeout(() => {
          onVerificationComplete(data, imagePreview || undefined);
        }, 400)
      );
    } catch (e: any) {
      clearStepTimers();
      onError(e.message || "Failed to verify image.");
    }
  };

  // --- Handlers for Video ---
  const handleVideoFileChange = (file: File) => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
  };

  const handleVideoDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingVideo(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/") && !/\.(mp4|mov|webm|avi|mkv)$/i.test(file.name)) {
      onError("Please drop a valid video file (MP4, MOV, WEBM).");
      return;
    }
    handleVideoFileChange(file);
  };

  const handleLoadSampleVideo = async () => {
    try {
      const res = await fetch("/samples/sample_video.mp4").catch(() => null);
      if (res && res.ok) {
        const blob = await res.blob();
        const file = new File([blob], "sample_video.mp4", { type: "video/mp4" });
        handleVideoFileChange(file);
      } else {
        // Trigger video input or sample prompt
        if (videoInputRef.current) {
          videoInputRef.current.click();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyVideo = async () => {
    if (!videoFile) {
      onError("Please select a video file (.mp4, .mov, .webm) to verify.");
      return;
    }

    try {
      clearStepTimers();
      onStartVerification(1);
      stepTimersRef.current.push(setTimeout(() => onStartVerification(2), 400));
      stepTimersRef.current.push(setTimeout(() => onStartVerification(3), 900));

      const formData = new FormData();
      formData.append("file", videoFile);
      if (forceRecheck) {
        formData.append("recheck", "true");
      }

      const res = await fetch(`${API_BASE}/api/verify/video`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Video verification failed");
      }

      clearStepTimers();
      onStartVerification(4);
      const data = await res.json();
      stepTimersRef.current.push(
        setTimeout(() => {
          onVerificationComplete(data);
        }, 400)
      );
    } catch (e: any) {
      clearStepTimers();
      onError(e.message || "Failed to verify video.");
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-obsidian-850/90 p-6 backdrop-blur-md shadow-2xl">
      {/* Studio Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Verification Studio
          </h2>
          <p className="text-xs text-slate-400">
            Submit digital assets to generate cryptographic SHA-256 fingerprints &amp; AI forensic proofs.
          </p>
        </div>

        {/* Tab Switcher & Re-audit control */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center space-x-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={forceRecheck}
              onChange={(e) => setForceRecheck(e.target.checked)}
              className="rounded border-slate-700 bg-obsidian-950 text-cyan-500 focus:ring-0"
            />
            <span className="text-[11px]">Force Re-Audit (Bypass Cache)</span>
          </label>

          <div className="flex rounded-xl border border-slate-800 bg-obsidian-950 p-1">
          <button
            onClick={() => setActiveTab("text")}
            className={`flex items-center space-x-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === "text"
                ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Text AI</span>
          </button>

          <button
            onClick={() => setActiveTab("image")}
            className={`flex items-center space-x-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === "image"
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>Image ELA</span>
          </button>

          <button
            onClick={() => setActiveTab("video")}
            className={`flex items-center space-x-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === "video"
                ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Video className="h-3.5 w-3.5" />
            <span>Video Temporal</span>
          </button>
        </div>
      </div>
    </div>

      {/* --- TAB 1: TEXT AI --- */}
      {activeTab === "text" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              News / Statement / Claim Content
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-slate-500">Quick-Load Demo:</span>
              <button
                type="button"
                onClick={() => handleLoadSampleText("authentic")}
                className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/20 transition"
              >
                Authentic Sample
              </button>
              <button
                type="button"
                onClick={() => handleLoadSampleText("fake")}
                className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[11px] font-medium text-rose-300 hover:bg-rose-500/20 transition"
              >
                Manipulated Sample
              </button>
            </div>
          </div>

          <textarea
            rows={5}
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Paste news articles, press releases, social media assertions, or quotes to analyze credibility and check against blockchain ledger..."
            className="w-full rounded-xl border border-slate-800 bg-obsidian-950 p-3.5 text-xs text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition leading-relaxed"
          />

          <div className="flex justify-end">
            <button
              onClick={handleVerifyText}
              disabled={isLoading || !textContent.trim()}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 transition"
            >
              <Sparkles className="h-4 w-4" />
              <span>{isLoading ? "Running Forensics & Ledger Proof..." : "Verify Text Integrity"}</span>
            </button>
          </div>
        </div>
      )}

      {/* --- TAB 2: IMAGE ELA --- */}
      {activeTab === "image" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Upload Image for Error Level Analysis &amp; EXIF Forensics
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-slate-500">Quick-Load Demo:</span>
              <button
                type="button"
                onClick={() => handleLoadSampleImage("authentic")}
                className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/20 transition"
              >
                Authentic Photo
              </button>
              <button
                type="button"
                onClick={() => handleLoadSampleImage("tampered")}
                className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[11px] font-medium text-rose-300 hover:bg-rose-500/20 transition"
              >
                Spliced / Tampered Photo
              </button>
            </div>
          </div>

          <input
            type="file"
            ref={imageInputRef}
            onChange={(e) => e.target.files?.[0] && handleImageFileChange(e.target.files[0])}
            accept=".jpg,.jpeg,.png,.webp"
            className="hidden"
          />

          <div
            onClick={() => imageInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingImage(true);
            }}
            onDragLeave={() => setIsDraggingImage(false)}
            onDrop={handleImageDrop}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition group ${
              isDraggingImage
                ? "border-emerald-400 bg-emerald-500/10"
                : "border-slate-800 bg-obsidian-950/60 hover:border-emerald-500/50 hover:bg-obsidian-900/50"
            }`}
          >
            {imagePreview ? (
              <div className="flex flex-col items-center space-y-2">
                <img
                  src={imagePreview}
                  alt="Upload Preview"
                  className="max-h-48 rounded-lg object-contain border border-slate-700"
                />
                <span className="text-xs text-emerald-400 font-medium">
                  {imageFile?.name || "Image ready for verification"} (Click to replace)
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-300">
                    Click or drag &amp; drop image here
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Supports JPG, PNG, WEBP for high-precision ELA compression re-synthesis
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleVerifyImage}
              disabled={isLoading || !imageFile}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 transition"
            >
              <Sparkles className="h-4 w-4" />
              <span>{isLoading ? "Analyzing ELA & Minting Proof..." : "Run Image Forensics"}</span>
            </button>
          </div>
        </div>
      )}

      {/* --- TAB 3: VIDEO TEMPORAL --- */}
      {activeTab === "video" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Upload Video for 10-Keyframe Temporal Consistency &amp; Flicker Analysis
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-slate-500">Quick-Load Demo:</span>
              <button
                type="button"
                onClick={handleLoadSampleVideo}
                className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-medium text-indigo-300 hover:bg-indigo-500/20 transition"
              >
                Load Sample Video (.mp4)
              </button>
            </div>
          </div>

          <input
            type="file"
            ref={videoInputRef}
            onChange={(e) => e.target.files?.[0] && handleVideoFileChange(e.target.files[0])}
            accept=".mp4,.mov,.webm,.avi"
            className="hidden"
          />

          <div
            onClick={() => videoInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingVideo(true);
            }}
            onDragLeave={() => setIsDraggingVideo(false)}
            onDrop={handleVideoDrop}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition group ${
              isDraggingVideo
                ? "border-indigo-400 bg-indigo-500/10"
                : "border-slate-800 bg-obsidian-950/60 hover:border-indigo-500/50 hover:bg-obsidian-900/50"
            }`}
          >
            {videoFile ? (
              <div className="flex flex-col items-center space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Video className="h-6 w-6" />
                </div>
                <span className="text-xs text-indigo-300 font-medium">
                  {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
                <span className="text-[11px] text-slate-500">
                  Click to choose different video file
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-300">
                    Click to select MP4 or MOV video
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Extracts 10 equidistant keyframes, evaluates temporal jump-cuts &amp; frame-by-frame ELA
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleVerifyVideo}
              disabled={isLoading || !videoFile}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50 transition"
            >
              <Sparkles className="h-4 w-4" />
              <span>{isLoading ? "Extracting Keyframes & Minting..." : "Analyze Video Forensics"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
