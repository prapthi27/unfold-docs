'use client';

import React, { useState } from 'react';
import { GlossaryItem } from '@/types';
import { BookOpen, Search, X, Check, HelpCircle } from 'lucide-react';

interface InteractiveGlossaryProps {
  glossary: GlossaryItem[];
  activeTerm: GlossaryItem | null;
  onSelectTerm: (term: GlossaryItem | null) => void;
}

export function InteractiveGlossary({
  glossary,
  activeTerm,
  onSelectTerm,
}: InteractiveGlossaryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedTerm, setCopiedTerm] = useState<string | null>(null);

  if (!glossary || glossary.length === 0) {
    return null;
  }

  const filteredGlossary = glossary.filter(
    (item) =>
      item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = (item: GlossaryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${item.term}: ${item.definition}`);
    setCopiedTerm(item.term);
    setTimeout(() => setCopiedTerm(null), 2000);
  };

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 shadow-sm transition-all">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-600 text-white shadow-xs">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-amber-950">
                Interactive Jargon Glossary
              </h3>
              <span className="inline-flex items-center rounded-full bg-amber-200/80 px-2 py-0.5 text-xs font-medium text-amber-900">
                {glossary.length} {glossary.length === 1 ? 'term' : 'terms'} identified
              </span>
            </div>
            <p className="text-xs text-amber-800/80">
              Plain-English definitions for complex phrases found in the source text. Click any card to inspect.
            </p>
          </div>
        </div>

        {glossary.length > 3 && (
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-amber-700/60" />
            <input
              type="text"
              placeholder="Filter terms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-amber-300 bg-white/90 py-1 pl-8 pr-3 text-xs text-slate-800 placeholder-amber-700/50 focus:border-amber-500 focus:outline-hidden focus:ring-1 focus:ring-amber-500 sm:w-44"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-amber-700/60 hover:text-amber-900"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Selected Term Detail Callout */}
      {activeTerm && (
        <div className="mt-3 rounded-lg border border-amber-300 bg-white p-3.5 shadow-xs transition-all">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                Selected Term Definition
              </span>
              <h4 className="text-sm font-bold text-slate-900">{activeTerm.term}</h4>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => handleCopy(activeTerm, e)}
                className="rounded px-2 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100 transition-colors"
                title="Copy term and definition"
              >
                {copiedTerm === activeTerm.term ? (
                  <span className="flex items-center gap-1 text-emerald-700">
                    <Check className="h-3 w-3" /> Copied
                  </span>
                ) : (
                  'Copy'
                )}
              </button>
              <button
                onClick={() => onSelectTerm(null)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                title="Close definition"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-700">
            {activeTerm.definition}
          </p>
        </div>
      )}

      {/* Term Cards Grid */}
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {filteredGlossary.map((item, index) => {
          const isSelected = activeTerm?.term === item.term;
          return (
            <div
              key={index}
              onClick={() => onSelectTerm(isSelected ? null : item)}
              className={`group flex cursor-pointer flex-col justify-between rounded-lg border p-2.5 transition-all ${
                isSelected
                  ? 'border-amber-500 bg-white shadow-xs ring-2 ring-amber-400/40'
                  : 'border-amber-200/90 bg-white/80 hover:border-amber-400 hover:bg-white hover:shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-xs text-amber-950 group-hover:text-amber-800">
                  {item.term}
                </span>
                <HelpCircle className="h-3.5 w-3.5 shrink-0 text-amber-500/70 group-hover:text-amber-600" />
              </div>
              <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-slate-600">
                {item.definition}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
