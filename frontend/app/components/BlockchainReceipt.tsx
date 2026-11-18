"use client";

import React, { useState } from "react";
import { Copy, Check, ShieldCheck, Database, Layers } from "lucide-react";

interface BlockchainData {
  txHash?: string;
  blockNumber?: number;
  timestamp?: number;
  contractAddress?: string;
  network?: string;
}

interface BlockchainReceiptProps {
  contentHash: string;
  mediaType: string;
  blockchain: BlockchainData;
  verifiedFromLedger: boolean;
}

export default function BlockchainReceipt({
  contentHash,
  mediaType,
  blockchain,
  verifiedFromLedger,
}: BlockchainReceiptProps) {
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedTx, setCopiedTx] = useState(false);

  const copyToClipboard = (text: string, isHash: boolean) => {
    navigator.clipboard.writeText(text);
    if (isHash) {
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    } else {
      setCopiedTx(true);
      setTimeout(() => setCopiedTx(false), 2000);
    }
  };

  const ts = blockchain.timestamp ? new Date(blockchain.timestamp * 1000) : new Date();
  const utcString = ts.toUTCString();
  const localString = ts.toLocaleString();

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-obsidian-850/90 p-6 backdrop-blur-md shadow-xl">
      {/* Header & Status Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Immutable Blockchain Ledger Proof
            </h3>
            <p className="text-xs text-slate-400">
              Hardhat EVM Smart Contract Consensus
            </p>
          </div>
        </div>

        {/* Status Badge */}
        {verifiedFromLedger ? (
          <div className="inline-flex items-center space-x-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Instant Match: Retrieved from Immutable Ledger</span>
          </div>
        ) : (
          <div className="inline-flex items-center space-x-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400">
            <Layers className="h-3.5 w-3.5" />
            <span>Newly Minted on Blockchain</span>
          </div>
        )}
      </div>

      {/* Details Grid */}
      <div className="mt-5 space-y-4 text-xs">
        {/* SHA-256 Fingerprint */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">
              SHA-256 Content Fingerprint
            </span>
            <button
              onClick={() => copyToClipboard(contentHash, true)}
              className="flex items-center space-x-1 text-slate-400 hover:text-cyan-400 transition"
            >
              {copiedHash ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  <span className="text-[11px] text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span className="text-[11px]">Copy Hash</span>
                </>
              )}
            </button>
          </div>
          <div className="rounded-xl border border-slate-800 bg-obsidian-950 p-2.5 font-mono text-[11px] text-cyan-300 break-all select-all">
            {contentHash}
          </div>
        </div>

        {/* Transaction Hash */}
        {blockchain.txHash && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">
                Transaction Hash (TxHash)
              </span>
              <button
                onClick={() => copyToClipboard(blockchain.txHash || "", false)}
                className="flex items-center space-x-1 text-slate-400 hover:text-cyan-400 transition"
              >
                {copiedTx ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="text-[11px] text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span className="text-[11px]">Copy Tx</span>
                  </>
                )}
              </button>
            </div>
            <div className="rounded-xl border border-slate-800 bg-obsidian-950 p-2.5 font-mono text-[11px] text-slate-300 break-all select-all">
              {blockchain.txHash}
            </div>
          </div>
        )}

        {/* Metas: Block Number, Contract, Timestamp */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-1">
          <div className="rounded-xl border border-slate-800 bg-obsidian-900/60 p-3">
            <span className="text-[10px] uppercase font-semibold text-slate-400">
              Block Number
            </span>
            <p className="mt-0.5 font-mono text-sm font-semibold text-white">
              #{blockchain.blockNumber ?? "Ledger Sync"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-obsidian-900/60 p-3">
            <span className="text-[10px] uppercase font-semibold text-slate-400">
              Media Type
            </span>
            <p className="mt-0.5 font-mono text-sm font-semibold uppercase text-cyan-400">
              {mediaType}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-obsidian-900/60 p-3">
            <span className="text-[10px] uppercase font-semibold text-slate-400">
              Target Contract
            </span>
            <p className="mt-0.5 font-mono text-xs font-semibold text-slate-300 truncate" title={blockchain.contractAddress}>
              {blockchain.contractAddress ? `${blockchain.contractAddress.slice(0, 10)}...${blockchain.contractAddress.slice(-8)}` : "TruthRegistry.sol"}
            </p>
          </div>
        </div>

        {/* Timestamps */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-3 text-[11px] text-slate-400">
          <div>
            <span className="text-slate-500 font-medium">UTC:</span> {utcString}
          </div>
          <div>
            <span className="text-slate-500 font-medium">Local:</span> {localString}
          </div>
        </div>
      </div>
    </div>
  );
}
