import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { getFirstFile, saveUpload } from '@/lib/uploads';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const buffer = await getFirstFile(formData);
    if (!buffer) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }
    const doc = await PDFDocument.load(buffer);
    const orderStr = (formData.get('order') as string) || '';
    const maxPage = doc.getPageCount();
    const order = orderStr.trim()
      ? orderStr.split(/[\s,]+/).map((p) => Math.max(0, Math.min(maxPage - 1, (parseInt(p, 10) || 1) - 1)))
      : [...Array(maxPage).keys()];
    const uniqueOrder = [...new Set(order)];
    if (uniqueOrder.length !== maxPage) {
      return NextResponse.json({ error: `Provide ${maxPage} page numbers for new order` }, { status: 400 });
    }
    const newDoc = await PDFDocument.create();
    const pages = await newDoc.copyPages(doc, uniqueOrder.length === maxPage ? uniqueOrder : [...Array(maxPage).keys()]);
    pages.forEach((p) => newDoc.addPage(p));
    const outBuf = Buffer.from(await newDoc.save());
    const outPath = await saveUpload(outBuf, '-organize.pdf');
    const name = outPath.split(/[/\\]/).pop()!;
    const baseUrl = request.nextUrl.origin;
    return NextResponse.json({
      downloadUrl: `${baseUrl}/api/download?f=${encodeURIComponent(name)}`,
      filename: 'organized.pdf',
    });
  } catch (e) {
    return NextResponse.json({
      error: e instanceof Error ? e.message : 'Organize failed',
    }, { status: 500 });
  }
}
