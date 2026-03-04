import { NextRequest, NextResponse } from 'next/server';
import { getFirstFile, saveUpload } from '@/lib/uploads';
import { unlockPdf } from '@/lib/qpdf';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const buffer = await getFirstFile(formData);
    const password = (formData.get('password') as string) || '';
    if (!buffer) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }
    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }
    const outBuf = await unlockPdf(buffer, password);
    const outPath = await saveUpload(outBuf, '-unlocked.pdf');
    const name = outPath.split(/[/\\]/).pop()!;
    const baseUrl = request.nextUrl.origin;
    return NextResponse.json({
      downloadUrl: `${baseUrl}/api/download?f=${encodeURIComponent(name)}`,
      filename: 'unlocked.pdf',
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unlock failed (wrong password?)';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
