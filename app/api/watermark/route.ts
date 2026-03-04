import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { getFirstFile } from '@/lib/uploads';
import { fileResponse } from '@/lib/response';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const buffer = await getFirstFile(formData);
    const text = (formData.get('text') as string) || 'DRAFT';
    if (!buffer) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }
    const doc = await PDFDocument.load(buffer);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const pages = doc.getPages();
    for (const page of pages) {
      const { width, height } = page.getSize();
      const fontSize = Math.min(48, width / 10);
      const tw = font.widthOfTextAtSize(text, fontSize);
      page.drawText(text, {
        x: (width - tw) / 2,
        y: height / 2 - fontSize / 2,
        size: fontSize,
        font,
        color: rgb(0.8, 0.8, 0.8),
        opacity: 0.3,
      });
    }
    const outBuf = Buffer.from(await doc.save());
    return fileResponse(outBuf, 'watermark.pdf');
  } catch (e) {
    return NextResponse.json({
      error: e instanceof Error ? e.message : 'Watermark failed',
    }, { status: 500 });
  }
}
