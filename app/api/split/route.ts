import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { getFirstFile, saveUpload } from '@/lib/uploads';
import JSZip from 'jszip';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const buffer = await getFirstFile(formData);
    if (!buffer) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }

    const doc = await PDFDocument.load(buffer);
    const total = doc.getPageCount();
    if (total === 0) {
      return NextResponse.json({ error: 'PDF has no pages' }, { status: 400 });
    }

    const zip = new JSZip();
    for (let i = 0; i < total; i++) {
      const single = await PDFDocument.create();
      const [page] = await single.copyPages(doc, [i]);
      single.addPage(page);
      const outBuf = await single.save();
      zip.file(`page-${i + 1}.pdf`, outBuf);
    }
    const zipBuf = await zip.generateAsync({ type: 'nodebuffer' });
    const outPath = await saveUpload(Buffer.from(zipBuf), '-split.zip');
    const name = outPath.split(/[/\\]/).pop()!;
    const baseUrl = request.nextUrl.origin;
    return NextResponse.json({
      downloadUrl: `${baseUrl}/api/download?f=${encodeURIComponent(name)}`,
      filename: 'split-pages.zip',
    });
  } catch (e) {
    return NextResponse.json({
      error: e instanceof Error ? e.message : 'Split failed',
    }, { status: 500 });
  }
}
