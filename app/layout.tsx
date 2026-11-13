import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UnfoldDocs — AI Document Simplification Workspace",
  description:
    "Translate dense, technical, and jargon-heavy reports into clear, everyday language while strictly preserving original meaning, figures, and obligations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        {children}
      </body>
    </html>
  );
}
