import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { getFirstFile } from '@/lib/uploads';
import { fileResponse } from '@/lib/response';

function parsePageRange(str: string, maxPage: number): number[] {
  const out: number[] = [];
  const parts = String(str || '1').trim().split(/[\s,]+/);
  for (const p of parts) {
    if (p.includes('-')) {
      const [a, b] = p.split('-').map((n) => Math.max(1, Math.min(maxPage, parseInt(n, 10) || 1)));
      for (let i = a; i <= b; i++) out.push(i);
    } else {
      const n = parseInt(p, 10) || 1;
      if (n >= 1 && n <= maxPage) out.push(n);
    }
  }
  return [...new Set(out)].sort((a, b) => a - b).map((n) => n - 1);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const buffer = await getFirstFile(formData);
    const range = (formData.get('pages') as string) || '1';
    if (!buffer) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }
    const doc = await PDFDocument.load(buffer);
    const maxPage = doc.getPageCount();
    const indices = parsePageRange(range, maxPage);
    if (!indices.length) {
      return NextResponse.json({ error: 'No valid pages (use e.g. 1,3,5 or 1-5)' }, { status: 400 });
    }
    const newDoc = await PDFDocument.create();
    const pages = await newDoc.copyPages(doc, indices);
    pages.forEach((p) => newDoc.addPage(p));
    const outBuf = Buffer.from(await newDoc.save());
    return fileResponse(outBuf, 'extracted.pdf');
  } catch (e) {
    return NextResponse.json({
      error: e instanceof Error ? e.message : 'Extract failed',
    }, { status: 500 });
  }
}
