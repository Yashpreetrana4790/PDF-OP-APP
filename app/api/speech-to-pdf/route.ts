import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { fileResponse } from '@/lib/response';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const text = (formData.get('text') as string) || 'Paste or type your text here to create a PDF.';
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
    return fileResponse(outBuf, 'document.pdf');
  } catch (e) {
    return NextResponse.json({
      error: e instanceof Error ? e.message : 'Speech to PDF failed',
    }, { status: 500 });
  }
}
