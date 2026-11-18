"use client";

import React, { useState, useEffect } from "react";
import {
  Database,
  Search,
  RefreshCw,
  Copy,
  Check,
  FileText,
  Image as ImageIcon,
  Video,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface LedgerRecord {
  contentHash: string;
  trustScore: number;
  mediaType: string;
  timestamp: number;
  contractAddress?: string;
}

interface AuditLedgerProps {
  lastUpdated?: number;
}

export default function AuditLedger({ lastUpdated }: AuditLedgerProps) {
  const [records, setRecords] = useState<LedgerRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const fetchLedger = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/ledger?limit=50`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records || []);
      }
    } catch (e) {
      console.error("Failed to load ledger records", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [lastUpdated]);

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.contentHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.mediaType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || rec.mediaType.toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesType;
  });

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-obsidian-850/90 p-6 backdrop-blur-md shadow-2xl">
      {/* Header & Controls */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">
              Live Blockchain Audit Ledger
            </h3>
            <p className="text-xs text-slate-400">
              Cryptographically verified records stored in TruthRegistry.sol ({records.length} total)
            </p>
          </div>
        </div>

        {/* Search, Filter & Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by hash..."
              className="rounded-xl border border-slate-800 bg-obsidian-950 py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 w-44 sm:w-56"
            />
          </div>

          {/* Filter Dropdown */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-slate-800 bg-obsidian-950 px-3 py-1.5 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
          >
            <option value="all">All Modalities</option>
            <option value="text">Text Only</option>
            <option value="image">Image Only</option>
            <option value="video">Video Only</option>
          </select>

          {/* Sync Button */}
          <button
            onClick={fetchLedger}
            disabled={loading}
            className="flex items-center space-x-1.5 rounded-xl border border-slate-800 bg-obsidian-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <th className="pb-3 pl-2">Media</th>
              <th className="pb-3">SHA-256 Fingerprint</th>
              <th className="pb-3">Trust Score</th>
              <th className="pb-3">Verdict</th>
              <th className="pb-3 pr-2">Block Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((rec, i) => {
                const ts = new Date(rec.timestamp * 1000);
                const isHigh = rec.trustScore >= 70;
                const isMedium = rec.trustScore >= 40 && rec.trustScore < 70;

                return (
                  <tr
                    key={i}
                    className="group hover:bg-obsidian-800/50 transition-colors"
                  >
                    {/* Media Type Icon */}
                    <td className="py-3 pl-2 font-sans">
                      <div className="flex items-center space-x-1.5">
                        {rec.mediaType === "text" && (
                          <FileText className="h-3.5 w-3.5 text-cyan-400" />
                        )}
                        {rec.mediaType === "image" && (
                          <ImageIcon className="h-3.5 w-3.5 text-emerald-400" />
                        )}
                        {rec.mediaType === "video" && (
                          <Video className="h-3.5 w-3.5 text-indigo-400" />
                        )}
                        <span className="font-semibold uppercase text-slate-300">
                          {rec.mediaType}
                        </span>
                      </div>
                    </td>

                    {/* Content Hash */}
                    <td className="py-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-300">
                          {rec.contentHash.slice(0, 12)}...{rec.contentHash.slice(-8)}
                        </span>
                        <button
                          onClick={() => copyHash(rec.contentHash)}
                          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-cyan-400 transition"
                          title="Copy full SHA-256 hash"
                        >
                          {copiedHash === rec.contentHash ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Trust Score */}
                    <td className="py-3">
                      <span
                        className={`font-bold ${
                          isHigh
                            ? "text-emerald-400"
                            : isMedium
                            ? "text-amber-400"
                            : "text-rose-400"
                        }`}
                      >
                        {rec.trustScore}%
                      </span>
                    </td>

                    {/* Verdict Pill */}
                    <td className="py-3 font-sans">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          isHigh
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : isMedium
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                            : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {isHigh ? (
                          <ShieldCheck className="mr-1 h-3 w-3" />
                        ) : isMedium ? (
                          <HelpCircle className="mr-1 h-3 w-3" />
                        ) : (
                          <ShieldAlert className="mr-1 h-3 w-3" />
                        )}
                        {isHigh ? "Authentic" : isMedium ? "Review" : "High Risk"}
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 pr-2 text-slate-400 text-[11px]">
                      {ts.toLocaleString()}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-xs text-slate-500 font-sans"
                >
                  {loading
                    ? "Fetching blockchain records..."
                    : "No verification records found on-chain. Submit an asset above to mint your first record."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
