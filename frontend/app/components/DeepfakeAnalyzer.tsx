"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  FileText,
  Image as ImageIcon,
  Video,
  UploadCloud,
  AlertCircle,
  RefreshCw,
  Cpu,
  Info,
} from "lucide-react";

export type InputMode = "text" | "image" | "video";

export interface DeepfakeAnalysisResult {
  authenticity_score: number;
  verdict: "Likely Real" | "Uncertain" | "Likely Fake";
  confidence: "High" | "Medium" | "Low";
  summary: string;
  indicators: string[];
}

export default function DeepfakeAnalyzer() {
  const [mode, setMode] = useState<InputMode>("text");
  const [textContent, setTextContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<DeepfakeAnalysisResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (file: File) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setErrorMsg(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, expected: "image" | "video") => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const valid =
      expected === "image"
        ? file.type.startsWith("image/") || /\.(jpg|jpeg|png|webp)$/i.test(file.name)
        : file.type.startsWith("video/") || /\.(mp4|mov|webm)$/i.test(file.name);
    if (!valid) {
      setErrorMsg(
        expected === "image"
          ? "Please drop a valid image file (JPG, PNG, WEBP)."
          : "Please drop a valid video file (MP4, MOV, WEBM)."
      );
      return;
    }
    handleFileChange(file);
  };

  const handleModeChange = (newMode: InputMode) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setMode(newMode);
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsDragging(false);
    setErrorMsg(null);
    setResult(null);
  };

  const handleSubmit = async () => {
    setErrorMsg(null);

    if (mode === "text" && !textContent.trim()) {
      setErrorMsg("Please enter text to analyze.");
      return;
    }
    if ((mode === "image" || mode === "video") && !selectedFile) {
      setErrorMsg(`Please upload a ${mode} file to analyze.`);
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      let res: Response;

      if (mode === "text") {
        res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: textContent }),
        });
      } else {
        const formData = new FormData();
        formData.append("file", selectedFile!);
        res = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
        });
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || err.error || "Analysis failed.");
      }

      const data: DeepfakeAnalysisResult = await res.json();
      setResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to connect to Deepfake Analyzer.");
    } finally {
      setIsLoading(false);
    }
  };

  // Color mapping based on exact prompt instructions:
  // 0–30: Likely Fake (Rose/Red)
  // 31–69: Uncertain (Amber/Yellow)
  // 70–100: Likely Real (Emerald/Green)
  const score = result?.authenticity_score ?? 0;
  const isFake = score <= 30;
  const isUncertain = score > 30 && score < 70;
  const isReal = score >= 70;

  const scoreColor = isFake
    ? "#F43F5E"
    : isUncertain
    ? "#F59E0B"
    : "#10B981";

  const scoreBgGlow = isFake
    ? "shadow-rose-500/20 border-rose-500/40"
    : isUncertain
    ? "shadow-amber-500/20 border-amber-500/40"
    : "shadow-emerald-500/20 border-emerald-500/40";

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-obsidian-850/90 p-6 backdrop-blur-md shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold tracking-tight text-white">
                Authenticity &amp; Deepfake Analyzer
              </h2>
              <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Multi-modal forensic evaluation of AI phrasing, deepfake blending, and generative artifacts.
            </p>
          </div>
        </div>

        {/* Input Selector Tabs */}
        <div className="flex rounded-xl border border-slate-800 bg-obsidian-950 p-1">
          <button
            onClick={() => handleModeChange("text")}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              mode === "text"
                ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Text</span>
          </button>
          <button
            onClick={() => handleModeChange("image")}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              mode === "image"
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>Image</span>
          </button>
          <button
            onClick={() => handleModeChange("video")}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              mode === "video"
                ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Video className="h-3.5 w-3.5" />
            <span>Video</span>
          </button>
        </div>
      </div>

      {/* Input Form */}
      <div className="space-y-4">
        {mode === "text" && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Submit Text for AI Phrasing &amp; Cadence Analysis
            </label>
            <textarea
              rows={4}
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Paste generated statements, articles, essays, or suspicious social copy to evaluate human vs AI generation..."
              className="w-full rounded-xl border border-slate-800 bg-obsidian-950 p-3.5 text-xs text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition leading-relaxed"
            />
          </div>
        )}

        {mode === "image" && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Upload Image (JPG, PNG, WEBP)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept=".jpg,.jpeg,.png,.webp"
              onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => handleDrop(e, "image")}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition group ${
                isDragging
                  ? "border-emerald-400 bg-emerald-500/10"
                  : "border-slate-800 bg-obsidian-950/60 hover:border-emerald-500/50 hover:bg-obsidian-900/50"
              }`}
            >
              {previewUrl ? (
                <div className="flex flex-col items-center space-y-2">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-48 rounded-lg object-contain border border-slate-700 shadow-md"
                  />
                  <span className="text-xs text-emerald-400 font-medium">
                    {selectedFile?.name} (Click to change)
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-semibold text-slate-300">
                    Click to select or drag &amp; drop image
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Analyzes lighting, shadows, reflections, hands, eyes, teeth, and background warping
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {mode === "video" && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Upload Video (MP4, MOV, WEBM)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept=".mp4,.mov,.webm"
              onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => handleDrop(e, "video")}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition group ${
                isDragging
                  ? "border-indigo-400 bg-indigo-500/10"
                  : "border-slate-800 bg-obsidian-950/60 hover:border-indigo-500/50 hover:bg-obsidian-900/50"
              }`}
            >
              {selectedFile ? (
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
                    <Video className="h-6 w-6" />
                  </div>
                  <span className="text-xs text-indigo-300 font-medium">
                    {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
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
                  <p className="text-xs font-semibold text-slate-300">
                    Click to select or drag &amp; drop video
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Evaluates temporal continuity, lip-sync, facial boundary blurring, and physics anomalies
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-400 hover:to-cyan-400 disabled:opacity-50 transition"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-white" />
                <span>Running Gemini 3.8 Flash Deepfake Analysis...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-white" />
                <span>Analyze Authenticity with Gemini</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading State Skeleton */}
      {isLoading && (
        <div className="rounded-xl border border-indigo-500/20 bg-obsidian-900/60 p-6 text-center space-y-3 animate-pulse">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
            <Cpu className="h-5 w-5 animate-spin" />
          </div>
          <p className="text-xs font-semibold text-slate-300">
            Gemini 3.8 Flash is conducting forensic evaluation...
          </p>
          <p className="text-[11px] text-slate-500">
            Inspecting generative artifacts, unnatural cadence, physics consistency, and biological features.
          </p>
        </div>
      )}

      {/* Result Card */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border p-6 bg-obsidian-900/90 shadow-xl ${scoreBgGlow} transition-all space-y-6`}
        >
          {/* Result Header & Gauge */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center border-b border-slate-800 pb-6">
            {/* Score & Gauge */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="relative flex items-center justify-center">
                <svg width={130} height={130} className="-rotate-90">
                  <circle
                    cx={65}
                    cy={65}
                    r={52}
                    stroke="#1E293B"
                    strokeWidth={10}
                    fill="transparent"
                  />
                  <circle
                    cx={65}
                    cy={65}
                    r={52}
                    stroke={scoreColor}
                    strokeWidth={10}
                    strokeDasharray={2 * Math.PI * 52}
                    strokeDashoffset={2 * Math.PI * 52 * (1 - score / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                    style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-black font-mono text-white">
                    {score}%
                  </span>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">
                    Authenticity
                  </span>
                </div>
              </div>

              {/* Progress Bar under gauge */}
              <div className="w-full max-w-[140px] mt-2">
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${score}%`, backgroundColor: scoreColor }}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-0.5">
                  <span>0 Fake</span>
                  <span>100 Real</span>
                </div>
              </div>
            </div>

            {/* Verdict and Confidence */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {/* Verdict Badge */}
                <div
                  className={`inline-flex items-center space-x-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
                    isReal
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : isUncertain
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                      : "border-rose-500/30 bg-rose-500/10 text-rose-400"
                  }`}
                >
                  {isReal && <ShieldCheck className="h-3.5 w-3.5" />}
                  {isUncertain && <HelpCircle className="h-3.5 w-3.5" />}
                  {isFake && <ShieldAlert className="h-3.5 w-3.5" />}
                  <span>Verdict: {result.verdict}</span>
                </div>

                {/* Confidence Badge */}
                <div className="inline-flex items-center space-x-1.5 rounded-full border border-slate-700 bg-obsidian-950 px-2.5 py-1 text-xs font-medium text-slate-300">
                  <span className="text-slate-500">Confidence:</span>
                  <span className="font-semibold text-cyan-400">{result.confidence}</span>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="rounded-xl border border-slate-800 bg-obsidian-950/70 p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Analyst Summary
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {result.summary}
                </p>
              </div>
            </div>
          </div>

          {/* Indicators / Red Flags */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <Info className="h-3.5 w-3.5 text-cyan-400" />
              <span>Forensic Observations &amp; Indicators ({result.indicators.length})</span>
            </h4>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {result.indicators.map((indicator, idx) => (
                <div
                  key={idx}
                  className="flex items-start space-x-2 rounded-xl border border-slate-800 bg-obsidian-950/70 p-3 text-xs text-slate-300"
                >
                  <span
                    className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${
                      isReal
                        ? "bg-emerald-400"
                        : isUncertain
                        ? "bg-amber-400"
                        : "bg-rose-400"
                    }`}
                  />
                  <span className="leading-relaxed">{indicator}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
