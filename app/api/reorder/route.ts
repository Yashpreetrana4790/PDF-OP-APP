import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { getFirstFile, saveUpload } from '@/lib/uploads';

function parseOrder(str: string, maxPage: number): number[] {
  const parts = String(str || '1,2,3').trim().split(/[\s,]+/);
  const out = parts
    .map((p) => parseInt(p, 10))
    .filter((n) => !isNaN(n) && n >= 1 && n <= maxPage);
  return [...new Set(out)].map((n) => n - 1);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const buffer = await getFirstFile(formData);
    const orderStr = (formData.get('order') as string) || '';
    if (!buffer) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }
    const doc = await PDFDocument.load(buffer);
    const maxPage = doc.getPageCount();
    const order = parseOrder(orderStr, maxPage);
    if (order.length !== maxPage) {
      return NextResponse.json({
        error: `Provide exactly ${maxPage} page numbers (e.g. 3,1,2 for pages 3,1,2)`,
      }, { status: 400 });
    }
    const newDoc = await PDFDocument.create();
    const pages = await newDoc.copyPages(doc, order);
    pages.forEach((p) => newDoc.addPage(p));
    const outBuf = Buffer.from(await newDoc.save());
    const outPath = await saveUpload(outBuf, '-reorder.pdf');
    const name = outPath.split(/[/\\]/).pop()!;
    const baseUrl = request.nextUrl.origin;
    return NextResponse.json({
      downloadUrl: `${baseUrl}/api/download?f=${encodeURIComponent(name)}`,
      filename: 'reordered.pdf',
    });
  } catch (e) {
    return NextResponse.json({
      error: e instanceof Error ? e.message : 'Reorder failed',
    }, { status: 500 });
  }
}
