import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { getFilesFromFormData, saveUpload } from '@/lib/uploads';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const buffers = await getFilesFromFormData(formData);
    if (!buffers.length) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }
    const doc = await PDFDocument.create();
    for (const buf of buffers) {
      const img = await sharp(buf).png().toBuffer();
      const page = doc.addPage();
      const { width, height } = page.getSize();
      const embed = await doc.embedPng(img);
      const dims = embed.scaleToFit(width, height);
      page.drawImage(embed, {
        x: (width - dims.width) / 2,
        y: (height - dims.height) / 2,
        width: dims.width,
        height: dims.height,
      });
    }
    const outBuf = Buffer.from(await doc.save());
    const outPath = await saveUpload(outBuf, '-images.pdf');
    const name = outPath.split(/[/\\]/).pop()!;
    const baseUrl = request.nextUrl.origin;
    return NextResponse.json({
      downloadUrl: `${baseUrl}/api/download?f=${encodeURIComponent(name)}`,
      filename: 'images-to-pdf.pdf',
    });
  } catch (e) {
    return NextResponse.json({
      error: e instanceof Error ? e.message : 'Conversion failed',
    }, { status: 500 });
  }
}
