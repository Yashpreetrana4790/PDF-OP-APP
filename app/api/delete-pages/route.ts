import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { getFirstFile } from '@/lib/uploads';
import { fileResponse } from '@/lib/response';

function parseIndices(str: string, maxPage: number): number[] {
  const toDelete = new Set<number>();
  const parts = String(str || '').trim().split(/[\s,]+/);
  for (const p of parts) {
    if (p.includes('-')) {
      const [a, b] = p.split('-').map((n) => Math.max(1, Math.min(maxPage, parseInt(n, 10) || 1)));
      for (let i = a; i <= b; i++) toDelete.add(i - 1);
    } else {
      const n = parseInt(p, 10) || 0;
      if (n >= 1 && n <= maxPage) toDelete.add(n - 1);
    }
  }
  return [...toDelete];
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const buffer = await getFirstFile(formData);
    const pagesStr = (formData.get('pages') as string) || '';
    if (!buffer) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }
    const doc = await PDFDocument.load(buffer);
    const maxPage = doc.getPageCount();
    const toDelete = parseIndices(pagesStr, maxPage);
    if (!toDelete.length) {
      return NextResponse.json({ error: 'Specify pages to delete (e.g. 2,5 or 3-6)' }, { status: 400 });
    }
    const keep = [...Array(maxPage).keys()].filter((i) => !toDelete.includes(i));
    if (keep.length === 0) {
      return NextResponse.json({ error: 'At least one page must remain' }, { status: 400 });
    }
    const newDoc = await PDFDocument.create();
    const pages = await newDoc.copyPages(doc, keep);
    pages.forEach((p) => newDoc.addPage(p));
    const outBuf = Buffer.from(await newDoc.save());
    return fileResponse(outBuf, 'document.pdf');
  } catch (e) {
    return NextResponse.json({
      error: e instanceof Error ? e.message : 'Delete pages failed',
    }, { status: 500 });
  }
}
