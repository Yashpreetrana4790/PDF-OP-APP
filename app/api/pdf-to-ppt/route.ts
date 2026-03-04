import { NextRequest, NextResponse } from 'next/server';
import { getFirstFile } from '@/lib/uploads';
import { fileResponse } from '@/lib/response';
import { convertWithLibreOffice } from '@/lib/libreoffice';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const buffer = await getFirstFile(formData);
    if (!buffer) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }
    const outBuf = await convertWithLibreOffice(buffer, '.pdf', 'pptx', 'pdf-to-ppt');
    return fileResponse(outBuf, 'converted.pptx');
  } catch (e) {
    return NextResponse.json({
      error: e instanceof Error ? e.message : 'Conversion failed. Install LibreOffice for PDF to PowerPoint.',
    }, { status: 500 });
  }
}
