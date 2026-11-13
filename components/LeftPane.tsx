'use client';

import React, { useRef, useState, useEffect } from 'react';
import { InputMode, GlossaryItem } from '@/types';
import {
  Upload,
  FileText,
  File,
  X,
  Loader2,
  Trash2,
  Sparkles,
  AlertCircle,
  Eye,
  Edit3,
} from 'lucide-react';

interface LeftPaneProps {
  originalText: string;
  inputMode: InputMode;
  fileName: string | null;
  fileSize: number | null;
  isUploading: boolean;
  activeGlossaryTerm?: GlossaryItem | null;
  glossary?: GlossaryItem[];
  onSelectGlossaryTerm?: (term: GlossaryItem | null) => void;
  onTextChange: (text: string) => void;
  onInputModeChange: (mode: InputMode) => void;
  onFileUpload: (file: File) => void;
  onClearText: () => void;
  onLoadSample: () => void;
  uploadError: string | null;
}

export function LeftPane({
  originalText,
  inputMode,
  fileName,
  fileSize,
  isUploading,
  activeGlossaryTerm,
  glossary = [],
  onSelectGlossaryTerm,
  onTextChange,
  onInputModeChange,
  onFileUpload,
  onClearText,
  onLoadSample,
  uploadError,
}: LeftPaneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'highlight'>('edit');

  const wordCount = originalText.trim()
    ? originalText.trim().split(/\s+/).length
    : 0;
  const charCount = originalText.length;
  const estimatedReadingMinutes = Math.max(1, Math.ceil(wordCount / 225));

  // Automatically switch to highlight view and smoothly scroll when an active term is selected
  useEffect(() => {
    if (activeGlossaryTerm && originalText.trim()) {
      setViewMode('highlight');
      const timer = setTimeout(() => {
        const el = document.getElementById('active-left-term');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeGlossaryTerm, originalText]);

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onFileUpload(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onFileUpload(file);
      e.target.value = '';
    }
  };

  // Helper to render original text with synchronized jargon highlights
  let firstActiveTermEncountered = false;
  const renderHighlightedOriginalText = () => {
    firstActiveTermEncountered = false;

    if (!glossary || glossary.length === 0) {
      return (
        <div className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-slate-800">
          {originalText}
        </div>
      );
    }

    const sortedTerms = [...glossary].sort((a, b) => b.term.length - a.term.length);
    const pattern = new RegExp(
      `\\b(${sortedTerms.map((t) => t.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`,
      'gi'
    );

    const paragraphs = originalText.split('\n\n');

    return (
      <div className="space-y-3 font-mono text-xs leading-relaxed text-slate-800">
        {paragraphs.map((para, pIdx) => {
          const parts = para.split(pattern);
          return (
            <p key={pIdx}>
              {parts.map((part, partIdx) => {
                const matchedItem = glossary.find(
                  (g) => g.term.toLowerCase() === part.toLowerCase()
                );

                if (matchedItem) {
                  const isActive =
                    activeGlossaryTerm?.term.toLowerCase() ===
                    matchedItem.term.toLowerCase();

                  let elementId: string | undefined = undefined;
                  if (isActive && !firstActiveTermEncountered) {
                    elementId = 'active-left-term';
                    firstActiveTermEncountered = true;
                  }

                  return (
                    <mark
                      key={partIdx}
                      id={elementId}
                      onClick={() =>
                        onSelectGlossaryTerm?.(isActive ? null : matchedItem)
                      }
                      className={`inline-block cursor-pointer rounded px-1 py-0.5 transition-all ${
                        isActive
                          ? 'bg-amber-300 text-amber-950 font-bold ring-2 ring-amber-500 shadow-xs'
                          : 'bg-amber-100 text-amber-900 border-b border-amber-400 hover:bg-amber-200'
                      }`}
                      title={`Glossary Term: "${matchedItem.term}" — Click to view definition`}
                    >
                      {part}
                    </mark>
                  );
                }

                return part;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col bg-white border-r border-slate-200">
      {/* Pane Subheader & Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50/70 px-4 py-2.5">
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
          <button
            onClick={() => onInputModeChange('paste')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-all ${
              inputMode === 'paste'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            Paste Text
          </button>
          <button
            onClick={() => onInputModeChange('upload')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-all ${
              inputMode === 'upload'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            Upload File (.pdf, .txt)
          </button>
        </div>

        {/* View Mode Toggle (Edit vs Highlights) */}
        <div className="flex items-center gap-2">
          {originalText && glossary.length > 0 && (
            <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs text-[11px]">
              <button
                onClick={() => setViewMode('edit')}
                className={`flex items-center gap-1 rounded-md px-2 py-0.5 font-medium transition-all ${
                  viewMode === 'edit'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Edit raw text"
              >
                <Edit3 className="h-3 w-3" />
                Edit
              </button>
              <button
                onClick={() => setViewMode('highlight')}
                className={`flex items-center gap-1 rounded-md px-2 py-0.5 font-medium transition-all ${
                  viewMode === 'highlight'
                    ? 'bg-amber-500 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="View synchronized jargon highlights"
              >
                <Eye className="h-3 w-3" />
                Highlights
              </button>
            </div>
          )}

          {originalText && (
            <button
              onClick={onClearText}
              className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-rose-600 transition-colors"
              title="Clear original text"
            >
              <Trash2 className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="flex items-start gap-2 border-b border-rose-200 bg-rose-50 px-4 py-2.5 text-xs text-rose-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Upload Failed</p>
            <p className="text-rose-700">{uploadError}</p>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        {/* Upload Mode Area */}
        {inputMode === 'upload' && (
          <div className="flex flex-col border-b border-slate-200 p-4 bg-slate-50/50">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all cursor-pointer ${
                isDragOver
                  ? 'border-indigo-500 bg-indigo-50/60'
                  : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50/80'
              }`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                  <p className="text-xs font-semibold text-indigo-950">
                    Extracting text with unpdf...
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Extracting pages and raw text stream from PDF
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      Drop your PDF or TXT document here, or{' '}
                      <span className="text-indigo-600 underline">browse</span>
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Supports .pdf (parsed server-side via unpdf), .txt, and .md
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Uploaded File Chip */}
            {fileName && !isUploading && (
              <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2.5 shadow-2xs">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-50 text-indigo-600">
                    <File className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-800">
                      {fileName}
                    </p>
                    {fileSize && (
                      <p className="text-[10px] text-slate-500">
                        {formatFileSize(fileSize)} • Extracted successfully
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearText();
                  }}
                  className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  title="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Text Area / Synchronized Highlight Preview */}
        <div className="relative flex flex-1 flex-col p-4 overflow-hidden">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {viewMode === 'highlight'
                ? 'Original Document (Synchronized Highlights)'
                : inputMode === 'upload'
                ? 'Extracted Document Text'
                : 'Source Document Text'}
            </label>
            {!originalText && (
              <button
                onClick={onLoadSample}
                className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <Sparkles className="h-3 w-3" />
                Load sample contract
              </button>
            )}
            {activeGlossaryTerm && viewMode === 'highlight' && (
              <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Tracking: <strong>{activeGlossaryTerm.term}</strong>
              </span>
            )}
          </div>

          {viewMode === 'highlight' && originalText ? (
            <div className="flex-1 w-full overflow-y-auto rounded-lg border border-slate-200 bg-slate-50/40 p-3.5">
              {renderHighlightedOriginalText()}
            </div>
          ) : (
            <textarea
              value={originalText}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder="Paste your legal contract, financial filing, medical report, or technical manual here... Or switch to 'Upload File' to parse a .pdf file."
              className="flex-1 w-full resize-none rounded-lg border border-slate-200 bg-slate-50/30 p-3.5 font-mono text-xs leading-relaxed text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          )}
        </div>
      </div>

      {/* Pane Footer: Statistics */}
      <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/70 px-4 py-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-3">
          <span>
            <strong>{wordCount}</strong> words
          </span>
          <span>•</span>
          <span>
            <strong>{charCount}</strong> characters
          </span>
          {wordCount > 0 && (
            <>
              <span>•</span>
              <span>~{estimatedReadingMinutes} min read</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
          <span className="text-[10px] uppercase font-medium tracking-wider">
            Original Source
          </span>
        </div>
      </div>
    </div>
  );
}
