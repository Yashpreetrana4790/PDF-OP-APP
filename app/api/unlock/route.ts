import { NextRequest, NextResponse } from 'next/server';
import { getFirstFile } from '@/lib/uploads';
import { unlockPdf } from '@/lib/qpdf';
import { fileResponse } from '@/lib/response';

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
    return fileResponse(Buffer.from(outBuf), 'unlocked.pdf');
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unlock failed (wrong password?)';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
