'use client';

import React from 'react';
import { compareReadability } from '@/lib/readability';
import {
  TrendingDown,
  Clock,
  Sparkles,
  ArrowRight,
  Gauge,
  HelpCircle,
} from 'lucide-react';

interface ReadabilityMetricsProps {
  originalText: string;
  simplifiedText: string;
}

export function ReadabilityMetrics({
  originalText,
  simplifiedText,
}: ReadabilityMetricsProps) {
  if (!simplifiedText.trim() || !originalText.trim()) {
    return null;
  }

  const comparison = compareReadability(originalText, simplifiedText);
  const {
    original,
    simplified,
    gradeReduction,
    percentageComplexityReduction,
    timeSavedFormatted,
  } = comparison;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition-all">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Left: Before vs. After Grades */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Gauge className="h-4 w-4 text-indigo-600 shrink-0" />
            <span className="font-semibold text-slate-700">Readability (FKGL):</span>
          </div>

          {/* Original Grade Pill */}
          <div className="flex items-center gap-1.5 rounded-lg border border-rose-200/80 bg-rose-50/70 px-2.5 py-1 text-xs">
            <span className="font-bold text-rose-900">Grade {original.grade}</span>
            <span className="text-[10px] text-rose-700">({original.gradeLabel})</span>
          </div>

          <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />

          {/* Simplified Grade Pill */}
          <div className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50/80 px-2.5 py-1 text-xs">
            <span className="font-bold text-emerald-900">Grade {simplified.grade}</span>
            <span className="text-[10px] text-emerald-700">({simplified.gradeLabel})</span>
          </div>
        </div>

        {/* Right: Badges for Complexity Drop & Time Saved */}
        <div className="flex flex-wrap items-center gap-2">
          {percentageComplexityReduction > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-xs font-bold text-emerald-800 shadow-2xs">
              <TrendingDown className="h-3.5 w-3.5" />
              <span>↓ {percentageComplexityReduction}% Complexity</span>
            </span>
          )}

          {comparison.wordsSaved > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
              <Clock className="h-3 w-3" />
              <span>{timeSavedFormatted}</span>
            </span>
          )}

          <div
            className="group relative cursor-help text-slate-400 hover:text-slate-600 hidden sm:block"
            title="Calculated using standard Flesch-Kincaid Grade Level formula based on syllable count and sentence length."
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>

      {/* Sub-bar: Sentence length details */}
      <div className="mt-2.5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-2 text-[11px] text-slate-500">
        <span>
          Avg sentence:{' '}
          <strong className="text-slate-700">{original.avgSentenceLength} words</strong> →{' '}
          <strong className="text-emerald-700">{simplified.avgSentenceLength} words</strong>
        </span>
        <span>•</span>
        <span>
          Total words:{' '}
          <strong className="text-slate-700">{original.words}</strong> →{' '}
          <strong className="text-emerald-700">{simplified.words}</strong>
          {comparison.percentageWordReduction > 0 && (
            <span className="text-slate-400"> (-{comparison.percentageWordReduction}%)</span>
          )}
        </span>
      </div>
    </div>
  );
}
