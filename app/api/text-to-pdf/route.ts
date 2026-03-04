import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { saveUpload } from '@/lib/uploads';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const text = (formData.get('text') as string) || 'Enter your text here.';
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const page = doc.addPage([612, 792]);
    const margin = 50;
    const lineHeight = 14;
    const maxWidth = 612 - margin * 2;
    const lines: string[] = [];
    let line = '';
    for (const word of text.split(/\s+/)) {
      const test = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(test, 12) > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = line ? `${line} ${word}` : word;
      }
    }
    if (line) lines.push(line);
    let y = 792 - margin;
    for (const ln of lines.slice(0, 200)) {
      if (y < margin) break;
      page.drawText(ln, {
        x: margin,
        y,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });
      y -= lineHeight;
    }
    const outBuf = Buffer.from(await doc.save());
    const outPath = await saveUpload(outBuf, '-text.pdf');
    const name = outPath.split(/[/\\]/).pop()!;
    const baseUrl = request.nextUrl.origin;
    return NextResponse.json({
      downloadUrl: `${baseUrl}/api/download?f=${encodeURIComponent(name)}`,
      filename: 'document.pdf',
    });
  } catch (e) {
    return NextResponse.json({
      error: e instanceof Error ? e.message : 'Text to PDF failed',
    }, { status: 500 });
  }
}
