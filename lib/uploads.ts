import { writeFile, mkdir, readFile, unlink, readdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOADS_DIR =
  process.env.VERCEL === '1'
    ? path.join('/tmp', 'uploads')
    : path.join(process.cwd(), 'uploads');
const MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes

export async function ensureUploadsDir() {
  await mkdir(UPLOADS_DIR, { recursive: true });
}

export function getUploadPath(filename: string): string {
  return path.join(UPLOADS_DIR, filename);
}

export async function saveUpload(
  buffer: Buffer,
  ext: string = '.pdf'
): Promise<string> {
  await ensureUploadsDir();
  const name = `${uuidv4()}${ext}`;
  const full = getUploadPath(name);
  await writeFile(full, buffer);
  return full;
}

export async function readUploadPath(fullPath: string): Promise<Buffer> {
  return readFile(fullPath);
}

export function deleteFile(fullPath: string): void {
  unlink(fullPath).catch(() => {});
}

export async function cleanupOldFiles() {
  await ensureUploadsDir();
  const files = await readdir(UPLOADS_DIR);
  const now = Date.now();
  for (const f of files) {
    const full = path.join(UPLOADS_DIR, f);
    const stat = await import('fs/promises').then((fs) => fs.stat(full).catch(() => null));
    if (stat && now - stat.mtimeMs > MAX_AGE_MS) {
      unlink(full).catch(() => {});
    }
  }
}

export async function getFilesFromFormData(formData: FormData): Promise<Buffer[]> {
  const files: Buffer[] = [];
  const entries = formData.getAll('files');
  for (const entry of entries) {
    if (entry instanceof File) {
      const buf = Buffer.from(await entry.arrayBuffer());
      if (buf.length) files.push(buf);
    }
  }
  return files;
}

export async function getFirstFile(formData: FormData): Promise<Buffer | null> {
  const files = await getFilesFromFormData(formData);
  return files[0] ?? null;
}
