"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, Cpu, Database, RefreshCw, Radio } from "lucide-react";

interface HealthData {
  status: string;
  aiEngines: {
    textAI: string;
    imageELA: string;
    videoForensics: string;
  };
  blockchain: {
    connected: boolean;
    contractAddress: string;
    chainId: number;
  };
}

export default function Navbar() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:8000/api/health");
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch {
      // Offline or connecting
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 8000);
    return () => clearInterval(interval);
  }, []);

  const isBcOnline = health?.blockchain?.connected ?? false;
  const isAiOnline = health?.status === "healthy";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-obsidian-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 shadow-lg shadow-cyan-500/20">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight text-white">
                Digital Truth Layer
              </span>
              <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-400">
                v1.0 Pro
              </span>
            </div>
            <p className="text-xs text-slate-400">
              AI Forensics &amp; Blockchain Trust Protocol
            </p>
          </div>
        </div>

        {/* Live Status Indicators */}
        <div className="flex items-center space-x-3">
          {/* AI Engine Status Pill */}
          <div className="flex items-center space-x-2 rounded-full border border-slate-800 bg-obsidian-850 px-3 py-1.5 text-xs shadow-inner">
            <Cpu className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-slate-400">AI Engines:</span>
            <span className="flex items-center font-medium text-emerald-400">
              <span className="mr-1.5 h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              {isAiOnline ? "Online (Text/Img/Vid)" : "Standby"}
            </span>
          </div>

          {/* Blockchain Node Status Pill */}
          <div className="flex items-center space-x-2 rounded-full border border-slate-800 bg-obsidian-850 px-3 py-1.5 text-xs shadow-inner">
            <Database className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-slate-400">Hardhat EVM:</span>
            <span className="flex items-center font-medium text-cyan-400">
              <span
                className={`mr-1.5 h-2 w-2 rounded-full ${
                  isBcOnline ? "bg-cyan-400 animate-pulse" : "bg-amber-400"
                }`}
              />
              {isBcOnline ? "Connected (31337)" : "Syncing"}
            </span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchHealth}
            disabled={loading}
            title="Refresh health status"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-obsidian-850 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`}
            />
          </button>
        </div>
      </div>
    </header>
  );
}
