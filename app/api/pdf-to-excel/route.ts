import { NextRequest, NextResponse } from 'next/server';
import { getFirstFile, saveUpload } from '@/lib/uploads';
import { convertWithLibreOffice } from '@/lib/libreoffice';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const buffer = await getFirstFile(formData);
    if (!buffer) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }
    const outBuf = await convertWithLibreOffice(buffer, '.pdf', 'xlsx', 'pdf-to-excel');
    const outPath = await saveUpload(outBuf, '-converted.xlsx');
    const name = outPath.split(/[/\\]/).pop()!;
    const baseUrl = request.nextUrl.origin;
    return NextResponse.json({
      downloadUrl: `${baseUrl}/api/download?f=${encodeURIComponent(name)}`,
      filename: 'converted.xlsx',
    });
  } catch (e) {
    return NextResponse.json({
      error: e instanceof Error ? e.message : 'Conversion failed. Install LibreOffice for PDF to Excel.',
    }, { status: 500 });
  }
}
