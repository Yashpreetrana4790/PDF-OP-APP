import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { getFirstFile, saveUpload } from '@/lib/uploads';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const buffer = await getFirstFile(formData);
    const title = formData.get('title') as string | null;
    const author = formData.get('author') as string | null;
    if (!buffer) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }
    const doc = await PDFDocument.load(buffer);
    if (title != null && title !== '') doc.setTitle(title);
    if (author != null && author !== '') doc.setAuthor(author);
    const outBuf = Buffer.from(await doc.save());
    const outPath = await saveUpload(outBuf, '-metadata.pdf');
    const name = outPath.split(/[/\\]/).pop()!;
    const baseUrl = request.nextUrl.origin;
    return NextResponse.json({
      downloadUrl: `${baseUrl}/api/download?f=${encodeURIComponent(name)}`,
      filename: 'document.pdf',
    });
  } catch (e) {
    return NextResponse.json({
      error: e instanceof Error ? e.message : 'Metadata update failed',
    }, { status: 500 });
  }
}
