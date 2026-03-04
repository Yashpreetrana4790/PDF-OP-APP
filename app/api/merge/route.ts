import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { getFilesFromFormData, saveUpload, getUploadPath, deleteFile } from '@/lib/uploads';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const buffers = await getFilesFromFormData(formData);
    if (!buffers.length) {
      return NextResponse.json({ error: 'No PDF files provided' }, { status: 400 });
    }

    const merged = await PDFDocument.create();
    for (const buf of buffers) {
      const doc = await PDFDocument.load(buf);
      const pages = await merged.copyPages(doc, doc.getPageIndices());
      pages.forEach((p) => merged.addPage(p));
    }
    const outBuf = Buffer.from(await merged.save());
    const outPath = await saveUpload(outBuf, '-merged.pdf');
    const name = outPath.split(/[/\\]/).pop()!;
    const baseUrl = request.nextUrl.origin;
    return NextResponse.json({
      downloadUrl: `${baseUrl}/api/download?f=${encodeURIComponent(name)}`,
      filename: 'merged.pdf',
    });
  } catch (e) {
    return NextResponse.json({
      error: e instanceof Error ? e.message : 'Merge failed',
    }, { status: 500 });
  }
}
