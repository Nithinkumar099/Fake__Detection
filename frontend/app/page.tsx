"use client";

import React, { useState } from "react";
import Navbar from "./components/Navbar";
import VerificationStudio from "./components/VerificationStudio";
import ProgressIndicator from "./components/ProgressIndicator";
import TrustScoreGauge from "./components/TrustScoreGauge";
import ForensicsView from "./components/ForensicsView";
import BlockchainReceipt from "./components/BlockchainReceipt";
import AuditLedger from "./components/AuditLedger";
import CertificateModal from "./components/CertificateModal";
import DeepfakeAnalyzer from "./components/DeepfakeAnalyzer";
import { Award, AlertTriangle, ShieldCheck, Sparkles } from "lucide-react";

export default function Home() {
  const [activeView, setActiveView] = useState<"blockchain" | "deepfake">("blockchain");

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Result state
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | undefined>(undefined);
  const [isCertificateOpen, setIsCertificateOpen] = useState<boolean>(false);
  const [lastLedgerUpdate, setLastLedgerUpdate] = useState<number>(Date.now());

  const handleStartVerification = (step: number) => {
    setIsLoading(true);
    setCurrentStep(step);
    setErrorMessage(null);
  };

  const handleVerificationComplete = (result: any, previewUrl?: string) => {
    setIsLoading(false);
    setCurrentStep(4);
    setVerificationResult(result);
    if (previewUrl) {
      setOriginalPreviewUrl(previewUrl);
    }
    setLastLedgerUpdate(Date.now());
  };

  const handleError = (msg: string) => {
    setIsLoading(false);
    setErrorMessage(msg);
  };

  return (
    <div className="flex min-h-screen flex-col bg-obsidian-900 text-slate-100">
      <Navbar />

      <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-3 pt-2 pb-2">
          <div className="inline-flex items-center space-x-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-400">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Cryptographic Proof &amp; Multi-Modal AI Forensics</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-white">
            Information Trust &amp; Authenticity Protocol
          </h1>

          <p className="mx-auto max-w-2xl text-xs sm:text-sm text-slate-400 leading-relaxed">
            Eliminate disinformation through hybrid intelligence. Content is evaluated with deep multi-modal
            AI, cross-referenced with live news wire registries, and immutably sealed on the Ethereum blockchain.
          </p>
        </div>

        {/* View Switcher: Blockchain Truth Layer vs Gemini Deepfake Analyzer */}
        <div className="flex justify-center">
          <div className="flex rounded-2xl border border-slate-800 bg-obsidian-950 p-1.5 shadow-2xl">
            <button
              onClick={() => setActiveView("blockchain")}
              className={`flex items-center space-x-2 rounded-xl px-5 py-2.5 text-xs font-bold transition ${
                activeView === "blockchain"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Truth Layer &amp; Blockchain Ledger</span>
            </button>

            <button
              onClick={() => setActiveView("deepfake")}
              className={`flex items-center space-x-2 rounded-xl px-5 py-2.5 text-xs font-bold transition ${
                activeView === "deepfake"
                  ? "bg-gradient-to-r from-indigo-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>Authenticity &amp; Deepfake Analyzer (Gemini 3.8)</span>
            </button>
          </div>
        </div>

        {/* VIEW 1: Authenticity & Deepfake Analyzer (Gemini 3.8 Flash) */}
        {activeView === "deepfake" && (
          <section className="mx-auto max-w-5xl animate-fade-in">
            <DeepfakeAnalyzer />
          </section>
        )}

        {/* VIEW 2: Traditional Truth Layer & Blockchain Ledger */}
        {activeView === "blockchain" && (
          <div className="space-y-10">
            {/* Error Notification */}
            {errorMessage && (
              <div className="mx-auto max-w-3xl rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs text-rose-300 flex items-center space-x-2.5">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Verification Studio */}
            <section className="mx-auto max-w-5xl">
              <VerificationStudio
                onStartVerification={handleStartVerification}
                onVerificationComplete={handleVerificationComplete}
                onError={handleError}
                isLoading={isLoading}
              />
            </section>

            {/* Live Progress Bar */}
            {(isLoading || verificationResult) && (
              <section className="mx-auto max-w-5xl animate-fade-in">
                <ProgressIndicator
                  currentStep={currentStep}
                  isFinished={!isLoading && !!verificationResult}
                  fromLedgerCache={verificationResult?.verifiedFromLedger}
                />
              </section>
            )}

            {/* Result Dashboard */}
            {verificationResult && (
              <section className="mx-auto max-w-5xl space-y-6 pt-2">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-white">
                      Verification Report &amp; Cryptographic Proof
                    </h2>
                    <p className="text-xs text-slate-400">
                      Consensus status: {verificationResult.verifiedFromLedger ? "Existing Ledger Match" : "Newly Verified & Stored on Chain"}
                    </p>
                  </div>

                  {/* Download Certificate Button */}
                  <button
                    onClick={() => setIsCertificateOpen(true)}
                    className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-emerald-400 transition"
                  >
                    <Award className="h-4 w-4" />
                    <span>Download Verification Certificate</span>
                  </button>
                </div>

                {/* Score & Ledger Proof Grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-1">
                    <TrustScoreGauge
                      score={verificationResult.trustScore}
                      verdict={verificationResult.verdict}
                      riskLevel={verificationResult.riskLevel}
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <BlockchainReceipt
                      contentHash={verificationResult.contentHash}
                      mediaType={verificationResult.mediaType}
                      blockchain={verificationResult.blockchain || {}}
                      verifiedFromLedger={verificationResult.verifiedFromLedger}
                    />
                  </div>
                </div>

                {/* Modality Forensics Breakdown */}
                <ForensicsView
                  mediaType={verificationResult.mediaType}
                  findings={verificationResult.findings || []}
                  originalPreviewUrl={originalPreviewUrl}
                  elaHeatmapBase64={verificationResult.elaHeatmapBase64}
                  evidenceLinks={verificationResult.evidenceLinks}
                  frameScores={verificationResult.frameScores}
                  metadata={verificationResult.metadata}
                  primaryClaim={verificationResult.primaryClaim}
                />
              </section>
            )}

            {/* Live Blockchain Audit Ledger Table */}
            <section className="mx-auto max-w-5xl pt-4">
              <AuditLedger lastUpdated={lastLedgerUpdate} />
            </section>
          </div>
        )}
      </main>

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        result={verificationResult}
      />

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800/80 bg-obsidian-950 py-8 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-2">
          <p className="font-semibold text-slate-400">
            Digital Truth Layer &copy; 2026 &bull; Production-Grade Full-Stack Truth System
          </p>
          <p className="text-[11px] text-slate-600">
            Hardhat EVM Consensus (Port 8545) &bull; FastAPI Multi-Modal Forensics (Port 8000) &bull; Next.js Cyber Dashboard (Port 3000)
          </p>
        </div>
      </footer>
    </div>
  );
}
