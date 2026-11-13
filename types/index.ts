export type AudienceMode = 'layperson' | 'high_school' | 'non_native';

export type AudienceLabel = 'Layperson' | 'High School Student' | 'Non-Native Speaker';

export type InputMode = 'paste' | 'upload';

export interface AudienceOption {
  id: AudienceMode;
  label: AudienceLabel;
  tagline: string;
  description: string;
  readingGrade: string;
}

export interface GlossaryItem {
  term: string;
  definition: string;
}

export interface SimplifyResponse {
  simplifiedText: string;
  keyTakeaways: string[];
  glossary: GlossaryItem[];
}

export interface DocumentState {
  originalText: string;
  simplifiedText: string;
  keyTakeaways: string[];
  glossary: GlossaryItem[];
  audienceMode: AudienceMode;
  inputMode: InputMode;
  fileName: string | null;
  fileSize: number | null;
  isProcessing: boolean;
  isUploading: boolean;
  lastSimplifiedAt: string | null;
  error: string | null;
  autoSimplifyOnChange: boolean;
  activeGlossaryTerm: GlossaryItem | null;
}
