import { extractText } from 'unpdf';
import { NextResponse } from 'next/server';


export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: 'No file provided. Please submit multipart form-data with a "file" field.' },
        { status: 400 }
      );
    }

    const filename = (file as File).name || 'document.pdf';
    const isPdf =
      filename.toLowerCase().endsWith('.pdf') ||
      file.type === 'application/pdf' ||
      file.type === 'application/x-pdf';

    if (!isPdf) {
      return NextResponse.json(
        { error: `Invalid file format for "${filename}". Only .pdf files are supported.` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      return NextResponse.json(
        { error: `The uploaded PDF "${filename}" is empty (0 bytes).` },
        { status: 400 }
      );
    }

    const uint8Array = new Uint8Array(arrayBuffer);
    const parsed = await extractText(uint8Array);

    let extractedText = '';
    const rawText = parsed.text as unknown;
    if (Array.isArray(rawText)) {
      extractedText = (rawText as string[])
        .map((pageText) => (pageText || '').trim())
        .filter(Boolean)
        .join('\n\n');
    } else if (typeof rawText === 'string') {
      extractedText = rawText.trim();
    }

    if (!extractedText) {
      return NextResponse.json(
        {
          error:
            `No readable text could be extracted from "${filename}". The document may contain scanned images without OCR, or may be encrypted.`,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      text: extractedText,
      totalPages: parsed.totalPages ?? 1,
      fileName: filename,
      fileSize: file.size,
    });
  } catch (err: unknown) {
    console.error('Error in /api/parse-pdf:', err);
    const message = err instanceof Error ? err.message : 'Failed to parse PDF document';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
