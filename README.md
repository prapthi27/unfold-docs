

# UnfoldDocs 🚀
AI-Powered Document Simplification & Comprehension Workspace

UnfoldDocs is a full-stack web application built for instant legal and dense document comprehension. It transforms complex contracts and agreements into plain-language summaries, calculates readability scores (FKGL), extracts key takeaways, and provides an interactive jargon glossary with synchronized document highlighting.

## ✨ Key Features
- **Split-Screen Workspace:** Original document viewer paired side-by-side with AI simplification.
- **Audience Adaptation:** Tailor the simplification level (e.g., High School Student, Layperson, Professional).
- **Readability Metrics (FKGL):** Real-time Flesch-Kincaid Grade Level comparison tracking complexity reduction percentage.
- **Key Takeaways & Core Obligations:** Automated extraction of critical legal liabilities and conditions.
- **Interactive Jargon Glossary:** Instant plain-English definitions for complex terms found in the source text.
- **Robust AI Fallback:** Powered by Google Gemini (`gemini-3.8-flash` primary with `gemini-3.5-flash-lite` automatic fallback).

## 🛠️ Tech Stack
- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS
- **Icons:** `lucide-react`
- **PDF Extraction:** `unpdf`
- **AI SDK:** Google Gemini SDK (`@google/genai`)

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone [https://github.com/prapthi27/unfold-docs.git](https://github.com/prapthi27/unfold-docs.git)
   cd unfold-docs
