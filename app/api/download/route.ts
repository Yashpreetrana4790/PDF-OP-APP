import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { readFile, unlink } from 'fs/promises';
import { getUploadPath } from '@/lib/uploads';

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get('f');
  if (!name || /[^a-zA-Z0-9._-]/.test(name)) {
    return NextResponse.json({ error: 'Invalid file' }, { status: 400 });
  }
  const full = getUploadPath(name);
  const contentTypes: Record<string, string> = {
    '.zip': 'application/zip',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  };
  const ext = name.includes('.') ? '.' + name.split('.').pop()! : '';
  const contentType = contentTypes[ext] || 'application/octet-stream';
  const downloadName = name.includes('-split.zip') ? 'split-pages.zip' : name.includes('-converted.') ? name.split('-').pop()! : (name.includes('-merged') ? 'merged.pdf' : name);
  try {
    const buf = await readFile(full);
    await unlink(full);
    return new NextResponse(buf, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${downloadName}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
