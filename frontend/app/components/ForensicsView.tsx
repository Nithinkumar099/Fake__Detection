"use client";

import React, { useState } from "react";
import {
  FileText,
  Image as ImageIcon,
  Video,
  ExternalLink,
  Info,
  CheckCircle,
  AlertTriangle,
  Flame,
  Layers,
  Camera,
  Eye,
} from "lucide-react";

interface EvidenceLink {
  title: string;
  snippet: string;
  url: string;
}

interface FrameScore {
  frameNumber: number;
  sampleIndex: number;
  timestamp: string;
  score: number;
  status: string;
  elaAnomaly: number;
}

interface ForensicsViewProps {
  mediaType: "text" | "image" | "video";
  findings: string[];
  originalPreviewUrl?: string;
  elaHeatmapBase64?: string;
  evidenceLinks?: EvidenceLink[];
  frameScores?: FrameScore[];
  metadata?: Record<string, any>;
  primaryClaim?: string;
}

export default function ForensicsView({
  mediaType,
  findings,
  originalPreviewUrl,
  elaHeatmapBase64,
  evidenceLinks = [],
  frameScores = [],
  metadata = {},
  primaryClaim,
}: ForensicsViewProps) {
  const [imageDisplayMode, setImageDisplayMode] = useState<"side-by-side" | "ela-only" | "orig-only">("side-by-side");

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-obsidian-850/90 p-6 backdrop-blur-md shadow-xl">
      <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          {mediaType === "text" && <FileText className="h-5 w-5 text-cyan-400" />}
          {mediaType === "image" && <ImageIcon className="h-5 w-5 text-emerald-400" />}
          {mediaType === "video" && <Video className="h-5 w-5 text-indigo-400" />}
          <h3 className="text-base font-bold text-white tracking-wide">
            Forensic Investigation Breakdown
          </h3>
        </div>
        <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
          Modality: {mediaType}
        </span>
      </div>

      {/* Forensic Findings Bullet Points */}
      <div className="mb-6 space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Neural Findings &amp; Forensic Analysis
        </h4>
        <div className="space-y-1.5">
          {findings.map((finding, idx) => (
            <div
              key={idx}
              className="flex items-start space-x-2 rounded-xl border border-slate-800/60 bg-obsidian-900/60 p-2.5 text-xs text-slate-300"
            >
              <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-cyan-400" />
              <span>{finding}</span>
            </div>
          ))}
        </div>
      </div>

      {/* TEXT SPECIFIC: Primary Claim & Evidence Cards */}
      {mediaType === "text" && (
        <div className="space-y-4">
          {primaryClaim && (
            <div className="rounded-xl border border-slate-800 bg-obsidian-900 p-3.5">
              <span className="text-[10px] uppercase font-bold text-slate-500">
                Primary Claim Extracted
              </span>
              <p className="mt-1 text-xs italic text-slate-200">
                &ldquo;{primaryClaim}&rdquo;
              </p>
            </div>
          )}

          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Cross-Referenced Web Evidence &amp; Fact-Checks
            </h4>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {evidenceLinks.map((item, i) => (
                <a
                  key={i}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col justify-between rounded-xl border border-slate-800 bg-obsidian-900/80 p-3 hover:border-cyan-500/50 hover:bg-obsidian-800/80 transition"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-cyan-300 group-hover:text-cyan-200 truncate">
                        {item.title}
                      </span>
                      <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-cyan-400 flex-shrink-0 ml-1" />
                    </div>
                    <p className="mt-1.5 text-[11px] text-slate-400 line-clamp-3">
                      {item.snippet}
                    </p>
                  </div>
                  <span className="mt-2 text-[10px] text-slate-500 truncate">
                    {item.url}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* IMAGE SPECIFIC: Side-by-Side ELA Viewer & EXIF Details */}
      {mediaType === "image" && (
        <div className="space-y-5">
          {/* Mode Switcher */}
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Error Level Analysis (ELA) Heatmap Comparison
            </h4>
            <div className="flex rounded-lg border border-slate-800 bg-obsidian-900 p-0.5 text-[11px]">
              <button
                onClick={() => setImageDisplayMode("side-by-side")}
                className={`px-2.5 py-1 rounded-md transition ${
                  imageDisplayMode === "side-by-side"
                    ? "bg-cyan-500 text-white font-medium"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Side-by-Side
              </button>
              <button
                onClick={() => setImageDisplayMode("ela-only")}
                className={`px-2.5 py-1 rounded-md transition ${
                  imageDisplayMode === "ela-only"
                    ? "bg-cyan-500 text-white font-medium"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                ELA Heatmap
              </button>
              <button
                onClick={() => setImageDisplayMode("orig-only")}
                className={`px-2.5 py-1 rounded-md transition ${
                  imageDisplayMode === "orig-only"
                    ? "bg-cyan-500 text-white font-medium"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Original
              </button>
            </div>
          </div>

          {/* Visual Comparer */}
          <div
            className={`grid gap-4 ${
              imageDisplayMode === "side-by-side"
                ? "grid-cols-1 md:grid-cols-2"
                : "grid-cols-1"
            }`}
          >
            {/* Original Image */}
            {(imageDisplayMode === "side-by-side" || imageDisplayMode === "orig-only") && (
              <div className="flex flex-col rounded-xl border border-slate-800 bg-obsidian-950 p-3">
                <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-400">
                  <span className="flex items-center">
                    <Eye className="mr-1 h-3.5 w-3.5 text-slate-400" /> Original Submission
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">
                    {metadata.dimensions || "RGB"}
                  </span>
                </div>
                <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-obsidian-900">
                  {originalPreviewUrl ? (
                    <img
                      src={originalPreviewUrl}
                      alt="Original Submission"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-slate-500">No preview available</span>
                  )}
                </div>
              </div>
            )}

            {/* ELA Heatmap Image */}
            {(imageDisplayMode === "side-by-side" || imageDisplayMode === "ela-only") && (
              <div className="flex flex-col rounded-xl border border-rose-950/60 bg-obsidian-950 p-3 shadow-lg shadow-rose-950/20">
                <div className="mb-2 flex items-center justify-between text-xs font-medium text-rose-400">
                  <span className="flex items-center">
                    <Flame className="mr-1 h-3.5 w-3.5 text-rose-400 animate-pulse" /> ELA Forensic Heatmap
                  </span>
                  <span className="font-mono text-[10px] text-rose-300">
                    Variance Ratio: {metadata.blockVarianceRatio || "N/A"}
                  </span>
                </div>
                <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-obsidian-900 border border-rose-900/40">
                  {elaHeatmapBase64 ? (
                    <img
                      src={elaHeatmapBase64}
                      alt="Error Level Analysis Heatmap"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-slate-500">Generating ELA Heatmap...</span>
                  )}
                </div>
                <p className="mt-2 text-[10px] text-slate-400 leading-tight">
                  Glowing bright clusters reveal compression disparities and spliced pixels against uniform background noise.
                </p>
              </div>
            )}
          </div>

          {/* EXIF Metadata Table */}
          {metadata && (
            <div className="rounded-xl border border-slate-800 bg-obsidian-900/70 p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Camera className="h-4 w-4 text-cyan-400" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  EXIF &amp; Metadata Inspection
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase text-slate-500 font-semibold">
                    Resolution
                  </span>
                  <p className="font-mono text-slate-200">{metadata.dimensions || "Unknown"}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 font-semibold">
                    Mean Error Level
                  </span>
                  <p className="font-mono text-slate-200">{metadata.meanErrorLevel || "0.0"}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 font-semibold">
                    Editing Software
                  </span>
                  <p className="font-mono text-amber-300 font-medium">
                    {Array.isArray(metadata.softwareSignatures)
                      ? metadata.softwareSignatures.join(", ")
                      : "None detected"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIDEO SPECIFIC: Keyframe Timeline Strip */}
      {mediaType === "video" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              10-Keyframe Temporal Consistency Strip
            </h4>
            <span className="text-[11px] font-mono text-slate-400">
              Duration: {metadata.durationSec || "0"}s | Total: {metadata.totalFrames || "0"} frames
            </span>
          </div>

          {/* Timeline Grid */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 md:grid-cols-10">
            {frameScores.map((frame, i) => {
              const isHigh = frame.score >= 70;
              const isMedium = frame.score >= 40 && frame.score < 70;

              return (
                <div
                  key={i}
                  className={`flex flex-col items-center rounded-xl border p-2 text-center transition ${
                    isHigh
                      ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
                      : isMedium
                      ? "border-amber-500/30 bg-amber-500/5 text-amber-400"
                      : "border-rose-500/40 bg-rose-500/10 text-rose-400"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    F{frame.sampleIndex}
                  </span>
                  <span className="my-1 font-mono text-sm font-extrabold text-white">
                    {frame.score}%
                  </span>
                  <span className="text-[9px] font-mono text-slate-500">
                    {frame.timestamp}
                  </span>
                  <span
                    className={`mt-1 rounded px-1.5 py-0.5 text-[8px] font-semibold uppercase ${
                      isHigh
                        ? "bg-emerald-500/20 text-emerald-300"
                        : isMedium
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-rose-500/20 text-rose-300"
                    }`}
                  >
                    {frame.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
