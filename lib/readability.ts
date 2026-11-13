export interface ReadabilityMetrics {
  grade: number;
  gradeLabel: string;
  words: number;
  sentences: number;
  avgSentenceLength: number;
  readingTimeMinutes: number;
  readingTimeFormatted: string;
}

export interface ReadabilityComparison {
  original: ReadabilityMetrics;
  simplified: ReadabilityMetrics;
  gradeReduction: number;
  percentageComplexityReduction: number;
  timeSavedFormatted: string;
  wordsSaved: number;
  percentageWordReduction: number;
}

/**
 * Heuristic syllable counter for English words.
 */
export function countSyllables(word: string): number {
  const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
  if (cleanWord.length === 0) return 0;
  if (cleanWord.length <= 3) return 1;

  // Remove common non-pronounced suffixes
  const processed = cleanWord
    .replace(/(?:[^laeiouy]|ed|es|e)$/, '')
    .replace(/^y/, '');

  const matches = processed.match(/[aeiouy]{1,2}/g);
  return matches ? Math.max(1, matches.length) : 1;
}

/**
 * Returns human-readable educational level for a given Flesch-Kincaid Grade Level.
 */
export function getGradeLabel(grade: number): string {
  if (grade >= 16) return 'Doctoral / Academic';
  if (grade >= 13) return 'College Level';
  if (grade >= 10) return 'High School';
  if (grade >= 7) return 'Plain English (Grade 7-8)';
  if (grade >= 5) return 'Conversational (Grade 5-6)';
  return 'Elementary';
}

/**
 * Calculates Flesch-Kincaid Grade Level and sentence statistics for a given text.
 */
export function calculateReadability(text: string): ReadabilityMetrics {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      grade: 0,
      gradeLabel: 'N/A',
      words: 0,
      sentences: 0,
      avgSentenceLength: 0,
      readingTimeMinutes: 0,
      readingTimeFormatted: '0 min',
    };
  }

  // Sentences split on standard sentence end markers
  const rawSentences = trimmed.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  const sentencesCount = Math.max(1, rawSentences.length);

  // Words split on spaces and word boundary characters
  const words = trimmed.match(/\b[a-zA-Z0-9'-]+\b/g) || [];
  const wordsCount = Math.max(1, words.length);

  // Syllables summation
  let totalSyllables = 0;
  for (const w of words) {
    totalSyllables += countSyllables(w);
  }

  const avgSentenceLength = wordsCount / sentencesCount;
  const avgSyllablesPerWord = totalSyllables / wordsCount;

  // Standard Flesch-Kincaid Grade Level Formula
  const rawGrade = 0.39 * avgSentenceLength + 11.8 * avgSyllablesPerWord - 15.59;
  const grade = Math.max(1, Math.min(20, Math.round(rawGrade * 10) / 10));

  // Reading time at ~200 words per minute
  const readingTimeMinutes = Math.round((wordsCount / 200) * 10) / 10;
  const minutes = Math.floor(wordsCount / 200);
  const seconds = Math.round(((wordsCount % 200) / 200) * 60);
  const readingTimeFormatted =
    minutes > 0 ? `${minutes}m ${seconds}s` : `${Math.max(10, seconds)}s`;

  return {
    grade,
    gradeLabel: getGradeLabel(grade),
    words: wordsCount,
    sentences: sentencesCount,
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    readingTimeMinutes,
    readingTimeFormatted,
  };
}

/**
 * Computes comparative readability, complexity drop %, and reading-time savings.
 */
export function compareReadability(
  originalText: string,
  simplifiedText: string
): ReadabilityComparison {
  const original = calculateReadability(originalText);
  const simplified = calculateReadability(simplifiedText);

  const gradeReduction = Math.max(
    0,
    Math.round((original.grade - simplified.grade) * 10) / 10
  );

  const percentageComplexityReduction =
    original.grade > 0
      ? Math.max(
          0,
          Math.min(
            95,
            Math.round(((original.grade - simplified.grade) / original.grade) * 100)
          )
        )
      : 0;

  const wordsSaved = Math.max(0, original.words - simplified.words);
  const percentageWordReduction =
    original.words > 0
      ? Math.max(0, Math.round((wordsSaved / original.words) * 100))
      : 0;

  // Time savings
  const totalSecondsOriginal = Math.round((original.words / 200) * 60);
  const totalSecondsSimplified = Math.round((simplified.words / 200) * 60);
  const secondsSaved = Math.max(0, totalSecondsOriginal - totalSecondsSimplified);

  const saveMin = Math.floor(secondsSaved / 60);
  const saveSec = secondsSaved % 60;
  const timeSavedFormatted =
    saveMin > 0 ? `${saveMin}m ${saveSec}s saved` : `${saveSec}s saved`;

  return {
    original,
    simplified,
    gradeReduction,
    percentageComplexityReduction,
    timeSavedFormatted,
    wordsSaved,
    percentageWordReduction,
  };
}
