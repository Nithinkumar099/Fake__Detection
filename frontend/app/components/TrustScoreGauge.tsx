"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, ShieldCheck, HelpCircle } from "lucide-react";

interface TrustScoreGaugeProps {
  score: number; // 0 to 100
  verdict: string;
  riskLevel: string;
}

export default function TrustScoreGauge({
  score,
  verdict,
  riskLevel,
}: TrustScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = Math.min(100, Math.max(0, score));
    const duration = 1000;
    const stepTime = 15;
    const totalSteps = duration / stepTime;
    const increment = end / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setAnimatedScore(end);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.round(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [score]);

  // Color tier mapping
  let strokeColor = "#10B981"; // Emerald
  let glowClass = "glow-emerald";
  let tierBadgeBg = "bg-emerald-500/15 border-emerald-500/30 text-emerald-400";
  let IconComponent = ShieldCheck;

  if (score < 40) {
    strokeColor = "#F43F5E"; // Crimson/Rose
    glowClass = "glow-rose";
    tierBadgeBg = "bg-rose-500/15 border-rose-500/30 text-rose-400";
    IconComponent = ShieldAlert;
  } else if (score < 70) {
    strokeColor = "#F59E0B"; // Amber
    glowClass = "glow-amber";
    tierBadgeBg = "bg-amber-500/15 border-amber-500/30 text-amber-400";
    IconComponent = HelpCircle;
  }

  // SVG parameters
  const size = 180;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className={`relative flex flex-col items-center justify-center rounded-2xl border border-slate-800/80 bg-obsidian-850/80 p-6 backdrop-blur-md ${glowClass} transition-all`}>
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="-rotate-90">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1E293B"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Value Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
          />
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-extrabold tracking-tight text-white font-mono"
          >
            {animatedScore}%
          </motion.span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Trust Score
          </span>
        </div>
      </div>

      {/* Tier & Verdict Badges */}
      <div className="mt-4 flex flex-col items-center space-y-1.5 text-center">
        <div
          className={`flex items-center space-x-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${tierBadgeBg}`}
        >
          <IconComponent className="h-3.5 w-3.5" />
          <span>{riskLevel}</span>
        </div>
        <p className="text-xs text-slate-300 font-medium">Verdict: {verdict}</p>
      </div>
    </div>
  );
}
