import { NextRequest, NextResponse } from 'next/server';
import { getFirstFile } from '@/lib/uploads';
import { fileResponse } from '@/lib/response';
import { convertWithLibreOffice } from '@/lib/libreoffice';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const buffer = await getFirstFile(formData);
    if (!buffer) {
      return NextResponse.json({ error: 'No Excel file provided' }, { status: 400 });
    }
    const ext = buffer[0] === 0x50 && buffer[1] === 0x4b ? '.xlsx' : '.xls';
    const outBuf = await convertWithLibreOffice(buffer, ext, 'pdf', 'excel-to-pdf');
    return fileResponse(outBuf, 'converted.pdf');
  } catch (e) {
    return NextResponse.json({
      error: e instanceof Error ? e.message : 'Conversion failed. Install LibreOffice for Excel to PDF.',
    }, { status: 500 });
  }
}
