import { NextRequest, NextResponse } from 'next/server';
import { getFirstFile } from '@/lib/uploads';
import { fileResponse } from '@/lib/response';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const buffer = await getFirstFile(formData);
    if (!buffer) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }
    const doc = await PDFDocument.load(buffer);
    const pageCount = doc.getPageCount();
    const zip = new JSZip();
    for (let i = 0; i < pageCount; i++) {
      const single = await PDFDocument.create();
      const [page] = await single.copyPages(doc, [i]);
      single.addPage(page);
      const pdfBuf = await single.save();
      zip.file(`page-${i + 1}.pdf`, pdfBuf);
    }
    const zipBuf = await zip.generateAsync({ type: 'nodebuffer' });
    return fileResponse(Buffer.from(zipBuf), 'pdf-pages.zip');
  } catch (e) {
    return NextResponse.json({
      error: e instanceof Error ? e.message : 'PDF to image requires external tools. Download as separate PDFs per page instead.',
    }, { status: 500 });
  }
}
