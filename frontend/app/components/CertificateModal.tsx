"use client";

import React from "react";
import { ShieldCheck, Award, Printer, X, CheckCircle, Database, Hash } from "lucide-react";

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: {
    contentHash: string;
    mediaType: string;
    trustScore: number;
    verdict: string;
    riskLevel: string;
    timestamp: number;
    verifiedFromLedger: boolean;
    blockchain: {
      txHash?: string;
      blockNumber?: number;
      contractAddress?: string;
    };
  } | null;
}

export default function CertificateModal({
  isOpen,
  onClose,
  result,
}: CertificateModalProps) {
  if (!isOpen || !result) return null;

  const handlePrint = () => {
    window.print();
  };

  const ts = new Date(result.timestamp * 1000);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-3xl border border-cyan-500/30 bg-obsidian-950 p-8 shadow-2xl text-slate-100 print:max-w-full print:p-0 print:border-none">
        {/* Close Button (Hidden on Print) */}
        <button
          onClick={onClose}
          className="no-print absolute top-5 right-5 rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Certificate Card Header */}
        <div className="text-center border-b border-slate-800 pb-6 print:border-slate-300">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 shadow-xl shadow-cyan-500/20 text-white">
            <Award className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white uppercase print:text-black">
            Digital Truth Certificate
          </h2>
          <p className="text-xs font-medium uppercase tracking-widest text-cyan-400 mt-1 print:text-cyan-700">
            Immutable AI Forensics &amp; Blockchain Attestation
          </p>
        </div>

        {/* Certificate Body */}
        <div className="my-6 space-y-5 text-xs">
          <div className="rounded-2xl border border-slate-800/80 bg-obsidian-900/60 p-5 print:bg-white print:border-slate-300">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 print:border-slate-200">
              <span className="font-semibold text-slate-400 uppercase text-[10px]">
                Attestation Verdict
              </span>
              <span
                className={`rounded-full px-3 py-1 font-bold text-xs ${
                  result.trustScore >= 70
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : result.trustScore >= 40
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                }`}
              >
                {result.verdict} ({result.trustScore}%)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] uppercase text-slate-500 font-semibold">
                  Media Classification
                </span>
                <p className="font-mono text-sm font-bold uppercase text-white mt-0.5 print:text-black">
                  {result.mediaType}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase text-slate-500 font-semibold">
                  Risk Category
                </span>
                <p className="text-sm font-semibold text-slate-300 mt-0.5 print:text-black">
                  {result.riskLevel}
                </p>
              </div>
            </div>
          </div>

          {/* Cryptographic Hashes */}
          <div className="space-y-3 font-mono text-[11px]">
            <div>
              <span className="text-[10px] uppercase font-sans font-semibold text-slate-400">
                SHA-256 Digital Fingerprint
              </span>
              <div className="mt-1 rounded-xl border border-slate-800 bg-obsidian-900 p-2.5 text-cyan-300 break-all select-all print:border-slate-300 print:text-black">
                {result.contentHash}
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-sans font-semibold text-slate-400">
                Blockchain Consensus Transaction Hash
              </span>
              <div className="mt-1 rounded-xl border border-slate-800 bg-obsidian-900 p-2.5 text-slate-300 break-all select-all print:border-slate-300 print:text-black">
                {result.blockchain.txHash || "Stored in TruthRegistry smart contract ledger"}
              </div>
            </div>
          </div>

          {/* Ledger Verification Details */}
          <div className="flex flex-wrap items-center justify-between border-t border-slate-800 pt-4 text-[11px] text-slate-400 print:border-slate-200">
            <div>
              <span className="font-semibold text-slate-300">Smart Contract:</span>{" "}
              {result.blockchain.contractAddress || "TruthRegistry.sol"}
            </div>
            <div>
              <span className="font-semibold text-slate-300">Timestamp:</span>{" "}
              {ts.toUTCString()}
            </div>
          </div>
        </div>

        {/* Footer / Buttons (Hidden on Print) */}
        <div className="no-print mt-6 flex items-center justify-end space-x-3 border-t border-slate-800 pt-5">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-800 bg-obsidian-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-emerald-400 transition"
          >
            <Printer className="h-4 w-4" />
            <span>Print / Save PDF Certificate</span>
          </button>
        </div>
      </div>
    </div>
  );
}
