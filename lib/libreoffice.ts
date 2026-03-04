import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { writeFile, readFile, readdir, unlink, mkdir } from 'fs/promises';
import { getUploadPath, ensureUploadsDir } from './uploads';
import { v4 as uuidv4 } from 'uuid';

const exec = promisify(execFile);

const EXT_MAP: Record<string, string> = {
  'pdf-to-word': 'docx',
  'pdf-to-excel': 'xlsx',
  'pdf-to-ppt': 'pptx',
  'word-to-pdf': 'pdf',
  'excel-to-pdf': 'pdf',
  'ppt-to-pdf': 'pdf',
};

export async function convertWithLibreOffice(
  inputBuf: Buffer,
  inputExt: string,
  outputExt: string,
  tool: string
): Promise<Buffer> {
  await ensureUploadsDir();
  const base = uuidv4();
  const inName = `${base}${inputExt}`;
  const inPath = getUploadPath(inName);
  const outDir = getUploadPath(base + '-out');
  await mkdir(outDir, { recursive: true });
  await writeFile(inPath, inputBuf);
  try {
    await exec(
      'soffice',
      ['--headless', '--convert-to', outputExt, '--outdir', outDir, inPath],
      { timeout: 60000 }
    );
    const files = await readdir(outDir);
    const outFile = files.find((f) => f.endsWith(outputExt)) || files[0];
    if (!outFile) throw new Error('Conversion produced no output');
    const outPath = path.join(outDir, outFile);
    const out = await readFile(outPath);
    await unlink(outPath).catch(() => {});
    return out;
  } finally {
    await unlink(inPath).catch(() => {});
    const remaining = await readdir(outDir).catch(() => []);
    for (const f of remaining) {
      await unlink(path.join(outDir, f)).catch(() => {});
    }
  }
}
