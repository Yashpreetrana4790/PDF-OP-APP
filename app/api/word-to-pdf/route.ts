import { NextRequest, NextResponse } from 'next/server';
import { getFirstFile, saveUpload } from '@/lib/uploads';
import { convertWithLibreOffice } from '@/lib/libreoffice';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const buffer = await getFirstFile(formData);
    if (!buffer) {
      return NextResponse.json({ error: 'No Word file provided' }, { status: 400 });
    }
    const ext = buffer[0] === 0x50 && buffer[1] === 0x4b ? '.docx' : '.doc';
    const outBuf = await convertWithLibreOffice(buffer, ext, 'pdf', 'word-to-pdf');
    const outPath = await saveUpload(outBuf, '-converted.pdf');
    const name = outPath.split(/[/\\]/).pop()!;
    const baseUrl = request.nextUrl.origin;
    return NextResponse.json({
      downloadUrl: `${baseUrl}/api/download?f=${encodeURIComponent(name)}`,
      filename: 'converted.pdf',
    });
  } catch (e) {
    return NextResponse.json({
      error: e instanceof Error ? e.message : 'Conversion failed. Install LibreOffice for Word to PDF.',
    }, { status: 500 });
  }
}
