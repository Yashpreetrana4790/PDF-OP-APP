import { NextRequest, NextResponse } from 'next/server';
import { getFilesFromFormData, saveUpload } from '@/lib/uploads';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import Tesseract from 'tesseract.js';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const buffers = await getFilesFromFormData(formData);
    if (!buffers.length) {
      return NextResponse.json({ error: 'No files provided. Upload PDF or images (JPG/PNG).' }, { status: 400 });
    }
    const outDoc = await PDFDocument.create();
    const font = await outDoc.embedFont(StandardFonts.Helvetica);

    for (let idx = 0; idx < buffers.length; idx++) {
      let imgBuf = buffers[idx];
      const isPdf = imgBuf[0] === 0x25 && imgBuf[1] === 0x50; // %P
      if (isPdf) {
        const doc = await PDFDocument.load(imgBuf);
        const pageCount = doc.getPageCount();
        for (let i = 0; i < pageCount; i++) {
          const [p] = await outDoc.copyPages(doc, [i]);
          outDoc.addPage(p);
        }
        continue;
      }
      const image = await sharp(imgBuf).png().toBuffer();
      const { data } = await Tesseract.recognize(image, 'eng', { logger: () => {} });
      const text = data.text?.trim() || '';
      const scale = 72 / 96;
      const w = Math.min(612, (data.width || 612) * scale);
      const h = Math.min(792, (data.height || 792) * scale);
      const page = outDoc.addPage([w, h]);
      const embed = await outDoc.embedPng(image);
      page.drawImage(embed, { x: 0, y: 0, width: w, height: h });
      const fontSize = 12;
      const lines = text.split(/\n/).filter((l) => l.trim());
      let y = h - 20;
      for (const line of lines.slice(0, 100)) {
        if (y < 20) break;
        page.drawText(line.slice(0, 100), {
          x: 20,
          y,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
          opacity: 0.01,
        });
        y -= fontSize + 2;
      }
    }

    const outBuf = Buffer.from(await outDoc.save());
    const outPath = await saveUpload(outBuf, '-ocr.pdf');
    const name = outPath.split(/[/\\]/).pop()!;
    const baseUrl = request.nextUrl.origin;
    return NextResponse.json({
      downloadUrl: `${baseUrl}/api/download?f=${encodeURIComponent(name)}`,
      filename: 'ocr.pdf',
    });
  } catch (e) {
    return NextResponse.json({
      error: e instanceof Error ? e.message : 'OCR failed.',
    }, { status: 500 });
  }
}
