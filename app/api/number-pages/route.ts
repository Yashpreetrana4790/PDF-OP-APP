import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { getFirstFile } from '@/lib/uploads';
import { fileResponse } from '@/lib/response';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const buffer = await getFirstFile(formData);
    if (!buffer) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }
    const doc = await PDFDocument.load(buffer);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const pages = doc.getPages();
    const total = pages.length;
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const { width, height } = page.getSize();
      const str = `${i + 1} / ${total}`;
      const fontSize = 10;
      const tw = font.widthOfTextAtSize(str, fontSize);
      page.drawText(str, {
        x: width - tw - 24,
        y: 24,
        size: fontSize,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
    }
    const outBuf = Buffer.from(await doc.save());
    return fileResponse(outBuf, 'numbered.pdf');
  } catch (e) {
    return NextResponse.json({
      error: e instanceof Error ? e.message : 'Number pages failed',
    }, { status: 500 });
  }
}
