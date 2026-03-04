import { NextResponse } from 'next/server';

const MIME_NAMES: Record<string, string> = {
  pdf: 'application/pdf',
  zip: 'application/zip',
  txt: 'text/plain',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

export function fileResponse(buffer: Buffer, filename: string, mime?: string): NextResponse {
  const ext = filename.includes('.') ? filename.split('.').pop()!.toLowerCase() : 'pdf';
  const contentType = mime || MIME_NAMES[ext] || 'application/octet-stream';
  const body = new Uint8Array(buffer);
  return new NextResponse(body, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
