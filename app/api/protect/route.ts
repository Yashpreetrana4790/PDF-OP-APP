import { NextRequest, NextResponse } from 'next/server';
import { getFirstFile, saveUpload } from '@/lib/uploads';
import { protectPdf } from '@/lib/qpdf';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const buffer = await getFirstFile(formData);
    const password = (formData.get('password') as string) || '';
    const confirm = (formData.get('confirmPassword') as string) || '';
    if (!buffer) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }
    if (!password || password.length < 4) {
      return NextResponse.json({ error: 'Password must be at least 4 characters' }, { status: 400 });
    }
    if (password !== confirm) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }
    const outBuf = await protectPdf(buffer, password);
    const outPath = await saveUpload(outBuf, '-protected.pdf');
    const name = outPath.split(/[/\\]/).pop()!;
    const baseUrl = request.nextUrl.origin;
    return NextResponse.json({
      downloadUrl: `${baseUrl}/api/download?f=${encodeURIComponent(name)}`,
      filename: 'protected.pdf',
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Protect failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
