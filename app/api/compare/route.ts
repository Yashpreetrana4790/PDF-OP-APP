import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { getFilesFromFormData } from '@/lib/uploads';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const buffers = await getFilesFromFormData(formData);
    if (buffers.length < 2) {
      return NextResponse.json({ error: 'Please upload 2 PDFs to compare' }, { status: 400 });
    }
    const [a, b] = buffers;
    const docA = await PDFDocument.load(a);
    const docB = await PDFDocument.load(b);
    const pagesA = docA.getPageCount();
    const pagesB = docB.getPageCount();
    const sizeA = a.length;
    const sizeB = b.length;
    const report = {
      file1: { pages: pagesA, sizeKB: Math.round(sizeA / 1024) },
      file2: { pages: pagesB, sizeKB: Math.round(sizeB / 1024) },
      samePageCount: pagesA === pagesB,
      sameSize: Math.abs(sizeA - sizeB) < 1024,
    };
    return NextResponse.json({
      report,
      message: report.samePageCount && report.sameSize
        ? 'PDFs have same page count and similar size.'
        : `Difference: File1 ${pagesA} pages (${report.file1.sizeKB} KB), File2 ${pagesB} pages (${report.file2.sizeKB} KB).`,
    });
  } catch (e) {
    return NextResponse.json({
      error: e instanceof Error ? e.message : 'Compare failed',
    }, { status: 500 });
  }
}
