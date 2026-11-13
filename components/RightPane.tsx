'use client';

import React, { useState, useEffect } from 'react';
import { AudienceMode, GlossaryItem } from '@/types';
import { AUDIENCE_OPTIONS } from '@/lib/sample-data';
import { InteractiveGlossary } from './InteractiveGlossary';
import { ReadabilityMetrics } from './ReadabilityMetrics';
import {
  Sparkles,
  Copy,
  Check,
  Download,
  AlertCircle,
  FileCheck2,
  CheckCircle2,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

interface RightPaneProps {
  originalText: string;
  simplifiedText: string;
  keyTakeaways: string[];
  glossary: GlossaryItem[];
  audienceMode: AudienceMode;
  isProcessing: boolean;
  hasOriginalText: boolean;
  lastSimplifiedAt: string | null;
  error: string | null;
  activeGlossaryTerm: GlossaryItem | null;
  onSelectGlossaryTerm: (term: GlossaryItem | null) => void;
  onSimplify: () => void;
  onExport: () => void;
  onLoadSample: () => void;
}

export function RightPane({
  originalText,
  simplifiedText,
  keyTakeaways,
  glossary,
  audienceMode,
  isProcessing,
  hasOriginalText,
  lastSimplifiedAt,
  error,
  activeGlossaryTerm,
  onSelectGlossaryTerm,
  onSimplify,
  onExport,
  onLoadSample,
}: RightPaneProps) {
  const [copied, setCopied] = useState(false);

  const currentAudience =
    AUDIENCE_OPTIONS.find((a) => a.id === audienceMode) || AUDIENCE_OPTIONS[0];

  // Auto-scroll to active term in simplified text
  useEffect(() => {
    if (activeGlossaryTerm && simplifiedText.trim()) {
      const timer = setTimeout(() => {
        const el = document.getElementById('active-right-term');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeGlossaryTerm, simplifiedText]);

  const handleCopy = () => {
    if (!simplifiedText) return;
    navigator.clipboard.writeText(simplifiedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = simplifiedText.trim()
    ? simplifiedText.trim().split(/\s+/).length
    : 0;

  // Helper to render text with interactive inline glossary term highlighting
  let firstActiveTermEncountered = false;
  const renderTextWithGlossaryHighlights = (text: string) => {
    if (!glossary || glossary.length === 0 || !text) {
      return text;
    }

    // Sort terms by descending length to match multi-word phrases first
    const sortedTerms = [...glossary].sort(
      (a, b) => b.term.length - a.term.length
    );

    const pattern = new RegExp(
      `\\b(${sortedTerms.map((t) => t.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`,
      'gi'
    );

    const parts = text.split(pattern);

    return parts.map((part, index) => {
      const matchedItem = glossary.find(
        (g) => g.term.toLowerCase() === part.toLowerCase()
      );

      if (matchedItem) {
        const isSelected =
          activeGlossaryTerm?.term.toLowerCase() === matchedItem.term.toLowerCase();

        let elementId: string | undefined = undefined;
        if (isSelected && !firstActiveTermEncountered) {
          elementId = 'active-right-term';
          firstActiveTermEncountered = true;
        }

        return (
          <span
            key={index}
            id={elementId}
            onClick={() => onSelectGlossaryTerm(isSelected ? null : matchedItem)}
            className={`inline-block cursor-pointer rounded px-1 py-0.5 font-medium transition-all ${
              isSelected
                ? 'bg-amber-300 text-amber-950 underline decoration-amber-600 underline-offset-2 ring-2 ring-amber-500 shadow-xs'
                : 'bg-amber-100/90 text-amber-900 border-b border-amber-400 hover:bg-amber-200'
            }`}
            title={`Jargon Term: "${matchedItem.term}" — Click to inspect definition`}
          >
            {part}
          </span>
        );
      }

      return part;
    });
  };

  return (
    <div className="flex h-full flex-col bg-slate-50/50">
      {/* Pane Subheader */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
            <span className="inline-block h-2 w-2 rounded-full bg-indigo-600"></span>
            Plain-Language Simplification
          </span>
          <span className="rounded-md bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
            {currentAudience.label} ({currentAudience.readingGrade})
          </span>
        </div>

        {/* Toolbar */}
        {simplifiedText && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
              title="Copy simplified text"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 text-slate-500" />
                  <span>Copy</span>
                </>
              )}
            </button>
            <button
              onClick={onExport}
              className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
              title="Export Markdown report"
            >
              <Download className="h-3 w-3 text-slate-500" />
              <span>Export</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-y-auto p-4 sm:p-6 space-y-4">
        {/* Error State */}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 shadow-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-bold text-rose-900">Simplification Error</h4>
                <p className="mt-1 text-rose-700 leading-relaxed">{error}</p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={onSimplify}
                    className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-rose-700 transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={onLoadSample}
                    className="rounded-md border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors"
                  >
                    Test with Sample Contract
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isProcessing && (
          <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 shadow-inner">
              <Sparkles className="h-8 w-8 text-indigo-600 animate-pulse" />
              <div className="absolute inset-0 rounded-2xl border-2 border-indigo-500 border-t-transparent animate-spin" />
            </div>
            <h3 className="mt-5 text-sm font-bold text-slate-800">
              Unfolding Document...
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500 leading-relaxed">
              Analyzing source text, rewriting for{' '}
              <strong className="text-indigo-600">{currentAudience.label}</strong>,
              preserving all figures and dates, and detecting jargon terms.
            </p>
            <div className="mt-6 flex items-center gap-2 text-[11px] text-slate-400">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping"></span>
              <span>Running Structured Output JSON Engine</span>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isProcessing && !simplifiedText && (
          <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 shadow-inner">
              <BookOpen className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-sm font-bold text-slate-800">
              No Simplification Generated Yet
            </h3>
            <p className="mt-1.5 max-w-sm text-xs text-slate-500 leading-relaxed">
              Paste a contract or upload a PDF in the left pane, then click{' '}
              <strong className="text-indigo-600 font-semibold">
                Unfold Document
              </strong>{' '}
              to translate it into plain, everyday language.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={onLoadSample}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-400 transition-all"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                Load Sample Agreement
              </button>
              {hasOriginalText && (
                <button
                  onClick={onSimplify}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-all"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                  Unfold Document Now
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results State */}
        {!isProcessing && simplifiedText && (
          <>
            {/* 1. Readability Comparison Banner */}
            <ReadabilityMetrics
              originalText={originalText}
              simplifiedText={simplifiedText}
            />

            {/* 2. Key Takeaways Callout Card */}
            {keyTakeaways && keyTakeaways.length > 0 && (
              <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 to-violet-50/50 p-4 shadow-xs">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-white">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-950">
                    Key Takeaways & Core Obligations
                  </h3>
                </div>
                <ul className="space-y-2">
                  {keyTakeaways.map((takeaway, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-800 leading-relaxed">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-200/70 text-[10px] font-bold text-indigo-800 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 3. Interactive Jargon Glossary */}
            {glossary && glossary.length > 0 && (
              <InteractiveGlossary
                glossary={glossary}
                activeTerm={activeGlossaryTerm}
                onSelectTerm={onSelectGlossaryTerm}
              />
            )}

            {/* 4. Simplified Text Section */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <FileCheck2 className="h-4 w-4 text-emerald-600" />
                  Rewritten Document Text
                </h3>
                <span className="text-[11px] text-slate-400">
                  Highlighted words are clickable glossary items
                </span>
              </div>

              <div className="space-y-3.5 text-xs leading-relaxed text-slate-800">
                {simplifiedText.split('\n\n').map((paragraph, index) => {
                  const trimmed = paragraph.trim();
                  if (!trimmed) return null;

                  // Render markdown-like headings
                  if (trimmed.startsWith('### ')) {
                    return (
                      <h4
                        key={index}
                        className="text-sm font-bold text-slate-900 pt-2 pb-1 border-b border-slate-100"
                      >
                        {renderTextWithGlossaryHighlights(trimmed.replace('### ', ''))}
                      </h4>
                    );
                  }

                  if (trimmed.startsWith('**') && trimmed.includes('**\n')) {
                    const lines = trimmed.split('\n');
                    return (
                      <div key={index} className="space-y-1">
                        <strong className="block text-slate-900 font-semibold">
                          {renderTextWithGlossaryHighlights(lines[0].replace(/\*\*/g, ''))}
                        </strong>
                        <p>{renderTextWithGlossaryHighlights(lines.slice(1).join(' '))}</p>
                      </div>
                    );
                  }

                  // Bullet lists
                  if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                    const bulletItems = trimmed.split('\n').filter(Boolean);
                    return (
                      <ul key={index} className="space-y-1.5 pl-4 list-disc">
                        {bulletItems.map((b, bIdx) => (
                          <li key={bIdx}>
                            {renderTextWithGlossaryHighlights(
                              b.replace(/^[-*]\s+/, '')
                            )}
                          </li>
                        ))}
                      </ul>
                    );
                  }

                  return (
                    <p key={index}>
                      {renderTextWithGlossaryHighlights(trimmed)}
                    </p>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Pane Footer: Metadata */}
      {simplifiedText && (
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/70 px-4 py-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              <strong>{wordCount}</strong> words simplified
            </span>
            {lastSimplifiedAt && (
              <>
                <span>•</span>
                <span>Generated {lastSimplifiedAt}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-indigo-700 font-medium">
            <Sparkles className="h-3 w-3" />
            <span>Fidelity Preserved</span>
          </div>
        </div>
      )}
    </div>
  );
}
