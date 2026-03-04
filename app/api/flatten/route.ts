import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { getFirstFile } from '@/lib/uploads';
import { fileResponse } from '@/lib/response';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const buffer = await getFirstFile(formData);
    if (!buffer) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }
    const doc = await PDFDocument.load(buffer);
    const outBuf = Buffer.from(await doc.save());
    return fileResponse(outBuf, 'flattened.pdf');
  } catch (e) {
    return NextResponse.json({
      error: e instanceof Error ? e.message : 'Flatten failed',
    }, { status: 500 });
  }
}
