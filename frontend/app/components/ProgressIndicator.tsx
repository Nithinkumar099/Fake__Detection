"use client";

import React from "react";
import { motion } from "framer-motion";
import { Hash, Search, Cpu, Coins, CheckCircle2 } from "lucide-react";

export type StepState = "pending" | "active" | "completed";

interface Step {
  id: number;
  name: string;
  desc: string;
  icon: React.ReactNode;
}

interface ProgressIndicatorProps {
  currentStep: number; // 1 to 4
  isFinished: boolean;
  fromLedgerCache?: boolean;
}

export default function ProgressIndicator({
  currentStep,
  isFinished,
  fromLedgerCache = false,
}: ProgressIndicatorProps) {
  const steps: Step[] = [
    {
      id: 1,
      name: "SHA-256 Fingerprint",
      desc: "Cryptographic hash generation",
      icon: <Hash className="h-4 w-4" />,
    },
    {
      id: 2,
      name: "Ledger Query",
      desc: "Checking TruthRegistry.sol",
      icon: <Search className="h-4 w-4" />,
    },
    {
      id: 3,
      name: fromLedgerCache ? "Cache Verified" : "AI Forensics",
      desc: fromLedgerCache ? "Retrieved immutable record" : "Multi-modal neural inspection",
      icon: <Cpu className="h-4 w-4" />,
    },
    {
      id: 4,
      name: fromLedgerCache ? "Ledger Confirmed" : "Blockchain Minting",
      desc: fromLedgerCache ? "Block timestamp verified" : "Hardhat consensus proof",
      icon: <Coins className="h-4 w-4" />,
    },
  ];

  return (
    <div className="w-full rounded-2xl border border-slate-800/80 bg-obsidian-850/90 p-5 backdrop-blur-md shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Verification Pipeline
        </h4>
        <span className="flex items-center text-xs font-medium text-cyan-400">
          {isFinished ? (
            <span className="flex items-center text-emerald-400">
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Complete
            </span>
          ) : (
            <span className="flex items-center">
              <span className="mr-1.5 h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              Processing Step {currentStep} of 4
            </span>
          )}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        {steps.map((step) => {
          const isDone = isFinished || currentStep > step.id;
          const isActive = !isFinished && currentStep === step.id;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative flex flex-col rounded-xl border p-3 transition-all ${
                isDone
                  ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-300"
                  : isActive
                  ? "border-cyan-500/60 bg-cyan-500/10 text-cyan-200 shadow-lg shadow-cyan-500/10"
                  : "border-slate-800 bg-obsidian-900/60 text-slate-500"
              }`}
            >
              <div className="flex items-center space-x-2.5 mb-1.5">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                    isDone
                      ? "bg-emerald-500/20 text-emerald-400"
                      : isActive
                      ? "bg-cyan-500/20 text-cyan-400 animate-pulse"
                      : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {isDone ? <CheckCircle2 className="h-4 w-4" /> : step.icon}
                </div>
                <span className="text-xs font-semibold">{step.name}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                {step.desc}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
