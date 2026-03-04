import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { writeFile, readFile, unlink } from 'fs/promises';
import { getUploadPath, ensureUploadsDir } from './uploads';
import { v4 as uuidv4 } from 'uuid';

const exec = promisify(execFile);

export async function protectPdf(inputBuf: Buffer, password: string): Promise<Buffer> {
  await ensureUploadsDir();
  const inName = `${uuidv4()}.pdf`;
  const outName = `${uuidv4()}-protected.pdf`;
  const inPath = getUploadPath(inName);
  const outPath = getUploadPath(outName);
  await writeFile(inPath, inputBuf);
  try {
    await exec('qpdf', ['--encrypt', password, password, '256', '--', inPath, outPath], {
      timeout: 30000,
    });
    const out = await readFile(outPath);
    return out;
  } finally {
    await unlink(inPath).catch(() => {});
    await unlink(outPath).catch(() => {});
  }
}

export async function unlockPdf(inputBuf: Buffer, password: string): Promise<Buffer> {
  await ensureUploadsDir();
  const inName = `${uuidv4()}.pdf`;
  const outName = `${uuidv4()}-unlocked.pdf`;
  const inPath = getUploadPath(inName);
  const outPath = getUploadPath(outName);
  await writeFile(inPath, inputBuf);
  try {
    await exec('qpdf', ['--decrypt', '--password=' + password, '--', inPath, outPath], {
      timeout: 30000,
    });
    const out = await readFile(outPath);
    return out;
  } finally {
    await unlink(inPath).catch(() => {});
    await unlink(outPath).catch(() => {});
  }
}
