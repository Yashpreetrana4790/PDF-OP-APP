import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { getFirstFile } from '@/lib/uploads';
import { fileResponse } from '@/lib/response';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const buffer = await getFirstFile(formData);
    const size = (formData.get('size') as string) || 'a4';
    if (!buffer) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }
    const doc = await PDFDocument.load(buffer);
    const dims: Record<string, [number, number]> = {
      a4: [595, 842],
      letter: [612, 792],
      legal: [612, 1008],
    };
    const [w, h] = dims[size.toLowerCase()] || dims.a4;
    const newDoc = await PDFDocument.create();
    const pages = doc.getPages();
    for (const page of pages) {
      const newPage = newDoc.addPage([w, h]);
      const { width, height } = page.getSize();
      const scale = Math.min(w / width, h / height);
      const embedded = await newDoc.embedPage(page);
      const dw = width * scale;
      const dh = height * scale;
      newPage.drawPage(embedded, {
        x: (w - dw) / 2,
        y: (h - dh) / 2,
        width: dw,
        height: dh,
      });
    }
    const outBuf = Buffer.from(await newDoc.save());
    return fileResponse(outBuf, 'resized.pdf');
  } catch (e) {
    return NextResponse.json({
      error: e instanceof Error ? e.message : 'Resize failed',
    }, { status: 500 });
  }
}
