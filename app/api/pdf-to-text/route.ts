import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { getFirstFile, saveUpload } from '@/lib/uploads';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const buffer = await getFirstFile(formData);
    if (!buffer) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }
    const doc = await PDFDocument.load(buffer);
    const pageCount = doc.getPageCount();
    const lines: string[] = [`PDF has ${pageCount} page(s).`, ''];
    const raw = buffer.toString('latin1');
    const textMatches = raw.match(/\([^)]*\)/g) || [];
    for (const m of textMatches.slice(0, 500)) {
      const t = m.slice(1, -1).replace(/\\[nrt]/g, ' ').trim();
      if (t.length > 1 && !/^[\d\s]+$/.test(t)) lines.push(t);
    }
    const text = lines.length > 2 ? lines.join('\n') : `PDF (${pageCount} pages). For better text extraction use the OCR tool with images.`;
    const outPath = await saveUpload(Buffer.from(text, 'utf-8'), '-text.txt');
    const name = outPath.split(/[/\\]/).pop()!;
    const baseUrl = request.nextUrl.origin;
    return NextResponse.json({
      downloadUrl: `${baseUrl}/api/download?f=${encodeURIComponent(name)}`,
      filename: 'extracted.txt',
    });
  } catch (e) {
    return NextResponse.json({
      error: e instanceof Error ? e.message : 'Extract text failed',
    }, { status: 500 });
  }
}
