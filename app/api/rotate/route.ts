import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, degrees } from 'pdf-lib';
import { getFirstFile, saveUpload } from '@/lib/uploads';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const buffer = await getFirstFile(formData);
    const angle = Number(formData.get('angle')) || 90;
    if (!buffer) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }
    const doc = await PDFDocument.load(buffer);
    const pages = doc.getPages();
    const rot = angle === 270 ? -90 : angle === 180 ? 180 : 90;
    pages.forEach((p) => p.setRotation(degrees(p.getRotation().angle + rot)));
    const outBuf = Buffer.from(await doc.save());
    const outPath = await saveUpload(outBuf, '-rotated.pdf');
    const name = outPath.split(/[/\\]/).pop()!;
    const baseUrl = request.nextUrl.origin;
    return NextResponse.json({
      downloadUrl: `${baseUrl}/api/download?f=${encodeURIComponent(name)}`,
      filename: 'rotated.pdf',
    });
  } catch (e) {
    return NextResponse.json({
      error: e instanceof Error ? e.message : 'Rotate failed',
    }, { status: 500 });
  }
}
