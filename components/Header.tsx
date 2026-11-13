'use client';

import React from 'react';
import { AudienceMode, AudienceOption } from '@/types';
import { AUDIENCE_OPTIONS } from '@/lib/sample-data';
import {
  Sparkles,
  Download,
  FileText,
  RotateCcw,
  Loader2,
  ChevronDown,
} from 'lucide-react';

interface HeaderProps {
  audienceMode: AudienceMode;
  onAudienceChange: (mode: AudienceMode) => void;
  onSimplify: () => void;
  onExport: () => void;
  onLoadSample: () => void;
  isProcessing: boolean;
  hasOriginalText: boolean;
  hasSimplifiedText: boolean;
  autoSimplifyOnChange: boolean;
  onToggleAutoSimplify: (enabled: boolean) => void;
}

export function Header({
  audienceMode,
  onAudienceChange,
  onSimplify,
  onExport,
  onLoadSample,
  isProcessing,
  hasOriginalText,
  hasSimplifiedText,
  autoSimplifyOnChange,
  onToggleAutoSimplify,
}: HeaderProps) {
  const currentAudience =
    AUDIENCE_OPTIONS.find((a) => a.id === audienceMode) || AUDIENCE_OPTIONS[0];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        {/* Brand / Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                UnfoldDocs
              </h1>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-500">
              AI Document Simplification & Comprehension Workspace
            </p>
          </div>
        </div>

        {/* Center / Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Audience Mode Selector */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/80 p-1">
            <span className="px-2 text-xs font-medium text-slate-500 hidden sm:inline">
              Audience:
            </span>
            <div className="relative">
              <select
                value={audienceMode}
                onChange={(e) => onAudienceChange(e.target.value as AudienceMode)}
                className="appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-xs font-semibold text-slate-800 shadow-xs border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                {AUDIENCE_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label} ({opt.readingGrade})
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            </div>
          </div>

          {/* Auto-Simplify on Audience Change Toggle */}
          <label className="hidden md:flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoSimplifyOnChange}
              onChange={(e) => onToggleAutoSimplify(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <span className="text-[11px] font-medium text-slate-600">
              Auto-unfold on change
            </span>
          </label>

          {/* Load Sample Button */}
          <button
            onClick={onLoadSample}
            disabled={isProcessing}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 transition-colors"
            title="Load sample contract to test"
          >
            <FileText className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">Sample Contract</span>
            <span className="sm:hidden">Sample</span>
          </button>

          {/* Export Markdown Button */}
          <button
            onClick={onExport}
            disabled={!hasSimplifiedText}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Download clean Markdown simplification report"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export Report</span>
            <span className="sm:hidden">Export</span>
          </button>

          {/* Prominent "Unfold Document" Primary Action Button */}
          <button
            onClick={onSimplify}
            disabled={isProcessing || !hasOriginalText}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm shadow-indigo-600/30 hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            title="Send document to Gemini 2.5 Flash for simplification"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Unfolding...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Unfold Document</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
