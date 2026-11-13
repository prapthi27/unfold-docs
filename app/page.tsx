'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AudienceMode, InputMode, GlossaryItem } from '@/types';
import {
  AUDIENCE_OPTIONS,
  SAMPLE_ORIGINAL_DOCUMENT,
  SAMPLE_SIMPLIFICATIONS,
  SAMPLE_KEY_TAKEAWAYS,
  SAMPLE_GLOSSARY,
} from '@/lib/sample-data';
import {
  generateMarkdownReport,
  downloadMarkdownFile,
} from '@/lib/export-markdown';
import { Header } from '@/components/Header';
import { LeftPane } from '@/components/LeftPane';
import { RightPane } from '@/components/RightPane';

export default function UnfoldDocsApp() {
  const [originalText, setOriginalText] = useState<string>('');
  const [simplifiedText, setSimplifiedText] = useState<string>('');
  const [keyTakeaways, setKeyTakeaways] = useState<string[]>([]);
  const [glossary, setGlossary] = useState<GlossaryItem[]>([]);
  const [audienceMode, setAudienceMode] = useState<AudienceMode>('layperson');
  const [inputMode, setInputMode] = useState<InputMode>('paste');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [simplifyError, setSimplifyError] = useState<string | null>(null);
  const [lastSimplifiedAt, setLastSimplifiedAt] = useState<string | null>(null);
  const [autoSimplifyOnChange, setAutoSimplifyOnChange] = useState<boolean>(false);
  const [activeGlossaryTerm, setActiveGlossaryTerm] = useState<GlossaryItem | null>(null);

  // Audience ID to Label mapper for API
  const getAudienceLabel = (mode: AudienceMode): 'Layperson' | 'High School Student' | 'Non-Native Speaker' => {
    switch (mode) {
      case 'high_school':
        return 'High School Student';
      case 'non_native':
        return 'Non-Native Speaker';
      case 'layperson':
      default:
        return 'Layperson';
    }
  };

  // Simplification trigger via /api/simplify
  const triggerSimplify = useCallback(
    async (targetMode: AudienceMode = audienceMode, textToSimplify: string = originalText) => {
      const text = textToSimplify.trim();
      if (!text) return;

      setIsProcessing(true);
      setSimplifyError(null);
      setActiveGlossaryTerm(null);

      try {
        const audienceLabel = getAudienceLabel(targetMode);
        const res = await fetch('/api/simplify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            audience: audienceLabel,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || `Simplification failed with status ${res.status}`);
        }

        setSimplifiedText(data.simplifiedText || '');
        setKeyTakeaways(Array.isArray(data.keyTakeaways) ? data.keyTakeaways : []);
        setGlossary(Array.isArray(data.glossary) ? data.glossary : []);
        setLastSimplifiedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } catch (err: unknown) {
        console.error('Error calling /api/simplify:', err);
        const msg = err instanceof Error ? err.message : 'Failed to simplify document';
        setSimplifyError(msg);
      } finally {
        setIsProcessing(false);
      }
    },
    [audienceMode, originalText]
  );

  // Audience change handler with auto-trigger
  const handleAudienceChange = (mode: AudienceMode) => {
    setAudienceMode(mode);
    if (autoSimplifyOnChange && originalText.trim().length > 0 && !isProcessing) {
      triggerSimplify(mode, originalText);
    }
  };

  // File upload handler supporting PDF (via /api/parse-pdf) & TXT/MD (client-side)
  const handleFileUpload = async (file: File) => {
    setUploadError(null);
    const name = file.name || 'document';
    const isPdf = name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';

    if (isPdf) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/parse-pdf', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to parse PDF document');
        }

        setOriginalText(data.text);
        setFileName(data.fileName || name);
        setFileSize(data.fileSize || file.size);
      } catch (err: unknown) {
        console.error('Error uploading/parsing PDF:', err);
        const msg = err instanceof Error ? err.message : 'Failed to extract text from PDF';
        setUploadError(msg);
      } finally {
        setIsUploading(false);
      }
    } else {
      // Plain text or markdown: read directly on client
      try {
        const text = await file.text();
        if (!text.trim()) {
          setUploadError(`The file "${name}" appears to be empty.`);
          return;
        }
        setOriginalText(text);
        setFileName(name);
        setFileSize(file.size);
      } catch (err: unknown) {
        console.error('Error reading text file:', err);
        setUploadError(`Failed to read file "${name}".`);
      }
    }
  };

  // Clear text
  const handleClearText = () => {
    setOriginalText('');
    setSimplifiedText('');
    setKeyTakeaways([]);
    setGlossary([]);
    setFileName(null);
    setFileSize(null);
    setSimplifyError(null);
    setUploadError(null);
    setActiveGlossaryTerm(null);
    setLastSimplifiedAt(null);
  };

  // Load realistic sample contract
  const handleLoadSample = () => {
    setOriginalText(SAMPLE_ORIGINAL_DOCUMENT);
    setSimplifiedText(SAMPLE_SIMPLIFICATIONS[audienceMode]);
    setKeyTakeaways(SAMPLE_KEY_TAKEAWAYS[audienceMode]);
    setGlossary(SAMPLE_GLOSSARY);
    setFileName('Sample-Master-Services-Agreement.txt');
    setFileSize(SAMPLE_ORIGINAL_DOCUMENT.length);
    setSimplifyError(null);
    setUploadError(null);
    setActiveGlossaryTerm(null);
    setLastSimplifiedAt('Sample Loaded');
  };

  // Export report to Markdown
  const handleExport = () => {
    if (!simplifiedText) return;
    const markdownContent = generateMarkdownReport({
      originalText,
      simplifiedText,
      keyTakeaways,
      glossary,
      audienceMode,
      fileName,
    });
    const downloadName = fileName
      ? `${fileName.replace(/\.[^/.]+$/, '')}-unfolded.md`
      : 'unfolddocs-simplification-report.md';
    downloadMarkdownFile(markdownContent, downloadName);
  };

  // Keyboard shortcut: Ctrl+Enter or Cmd+Enter to trigger simplify
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (originalText.trim() && !isProcessing) {
          e.preventDefault();
          triggerSimplify();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [originalText, isProcessing, triggerSimplify]);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-slate-100 text-slate-900">
      {/* Top Application Header */}
      <Header
        audienceMode={audienceMode}
        onAudienceChange={handleAudienceChange}
        onSimplify={() => triggerSimplify()}
        onExport={handleExport}
        onLoadSample={handleLoadSample}
        isProcessing={isProcessing}
        hasOriginalText={originalText.trim().length > 0}
        hasSimplifiedText={simplifiedText.trim().length > 0}
        autoSimplifyOnChange={autoSimplifyOnChange}
        onToggleAutoSimplify={setAutoSimplifyOnChange}
      />

      {/* 50/50 Split-Screen Comparative Workspace */}
      <main className="flex flex-1 overflow-hidden">
        <div className="grid h-full w-full grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* Left Pane: Original Source Document */}
          <section className="h-full overflow-hidden">
            <LeftPane
              originalText={originalText}
              inputMode={inputMode}
              fileName={fileName}
              fileSize={fileSize}
              isUploading={isUploading}
              activeGlossaryTerm={activeGlossaryTerm}
              glossary={glossary}
              onSelectGlossaryTerm={setActiveGlossaryTerm}
              onTextChange={setOriginalText}
              onInputModeChange={setInputMode}
              onFileUpload={handleFileUpload}
              onClearText={handleClearText}
              onLoadSample={handleLoadSample}
              uploadError={uploadError}
            />
          </section>

          {/* Right Pane: Plain-Language & Interactive Glossary */}
          <section className="h-full overflow-hidden">
            <RightPane
              originalText={originalText}
              simplifiedText={simplifiedText}
              keyTakeaways={keyTakeaways}
              glossary={glossary}
              audienceMode={audienceMode}
              isProcessing={isProcessing}
              hasOriginalText={originalText.trim().length > 0}
              lastSimplifiedAt={lastSimplifiedAt}
              error={simplifyError}
              activeGlossaryTerm={activeGlossaryTerm}
              onSelectGlossaryTerm={setActiveGlossaryTerm}
              onSimplify={() => triggerSimplify()}
              onExport={handleExport}
              onLoadSample={handleLoadSample}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
