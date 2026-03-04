'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Tool } from '@/lib/tools';
import FileDropZone from '@/components/FileDropZone';
import styles from './ToolClient.module.css';

interface ToolClientProps {
  tool: Tool;
}

export default function ToolClient({ tool }: ToolClientProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ url: string; filename: string } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [extra, setExtra] = useState<Record<string, string>>({});

  const isTextOnly = tool.slug === 'text-to-pdf' || tool.slug === 'speech-to-pdf';
  const canRunWithoutFiles = isTextOnly && (extra.text?.trim()?.length ?? 0) > 0;
  const needsFiles = !isTextOnly;
  const hasEnoughInput = needsFiles ? files.length > 0 : canRunWithoutFiles;

  const accept =
    tool.slug === 'ocr-pdf'
      ? '.pdf,.jpg,.jpeg,.png'
      : tool.slug === 'jpg-to-pdf'
      ? '.jpg,.jpeg,.png,.gif,.webp'
      : tool.slug.includes('word') || tool.slug === 'word-to-pdf'
      ? '.pdf,.doc,.docx'
      : tool.slug.includes('excel') || tool.slug === 'excel-to-pdf'
      ? '.pdf,.xls,.xlsx'
      : tool.slug.includes('ppt') || tool.slug === 'ppt-to-pdf'
      ? '.pdf,.ppt,.pptx'
      : '.pdf';

  const handleProcess = async () => {
    if (tool.slug === 'compare-pdf' && files.length !== 2) {
      setError('Please upload exactly 2 PDFs to compare.');
      return;
    }
    if (needsFiles && !files.length) {
      setError('Please add at least one file.');
      return;
    }
    if (isTextOnly && !extra.text?.trim()) {
      setError('Please enter some text.');
      return;
    }
    setError(null);
    setResult(null);
    setMessage(null);
    setLoading(true);
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    Object.entries(extra).forEach(([k, v]) => {
      if (v != null && String(v).trim()) formData.append(k, String(v).trim());
    });
    try {
      const res = await fetch(tool.apiRoute, {
        method: 'POST',
        body: formData,
      });
      const contentType = res.headers.get('content-type') || '';
      const isFile =
        contentType.includes('application/pdf') ||
        contentType.includes('application/zip') ||
        contentType.includes('text/plain') ||
        contentType.includes('application/vnd.') ||
        contentType.includes('application/octet-stream');

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || res.statusText || 'Something went wrong.');
        return;
      }

      if (isFile && res.ok) {
        const blob = await res.blob();
        const disp = res.headers.get('content-disposition') || '';
        const match = disp.match(/filename="?([^";\n]+)"?/);
        const filename = match ? match[1].trim() : 'download';
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        setResult({ url: '', filename });
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (data.downloadUrl && data.filename) {
        setResult({ url: data.downloadUrl, filename: data.filename });
      } else if (data.message) {
        setMessage(data.message);
      } else if (data.report) {
        const r = data.report;
        setMessage(
          `File 1: ${r.file1?.pages ?? '?'} pages, ${r.file1?.sizeKB ?? '?'} KB. File 2: ${r.file2?.pages ?? '?'} pages, ${r.file2?.sizeKB ?? '?'} KB. ${data.message || ''}`
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const needsPassword = tool.slug === 'protect-pdf' || tool.slug === 'unlock-pdf';
  const showPassword = tool.slug === 'protect-pdf';
  const showPagesInput = ['extract-pages', 'delete-pages'].includes(tool.slug);
  const showOrderInput = ['reorder', 'organize'].includes(tool.slug);
  const showWatermarkText = tool.slug === 'add-watermark';
  const showResizeSelect = tool.slug === 'resize-pdf';
  const showTextArea = isTextOnly;

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href="/">Home</Link>
        <span>/</span>
        <span>{tool.name}</span>
      </div>

      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.icon}>{tool.icon}</span>
          <h1 className={styles.title}>{tool.name}</h1>
          <p className={styles.desc}>{tool.description}</p>
        </div>

        {!isTextOnly && (
          <FileDropZone
            onFiles={(f) => setFiles((prev) => [...prev, ...f].slice(0, tool.slug === 'compare-pdf' ? 2 : 20))}
            accept={accept}
            multiple={tool.slug !== 'speech-to-pdf'}
            maxFiles={tool.slug === 'compare-pdf' ? 2 : tool.slug === 'merge-pdf' ? 20 : 10}
            label="Drag and drop files here or click to browse"
          />
        )}

        {showTextArea && (
          <div className={styles.extra}>
            <label>
              Text to convert to PDF
              <textarea
                value={extra.text || ''}
                onChange={(e) => setExtra((p) => ({ ...p, text: e.target.value }))}
                placeholder="Paste or type your text here..."
                className={styles.textarea}
                rows={6}
              />
            </label>
          </div>
        )}

        {files.length > 0 && (
          <div className={styles.fileList}>
            {files.map((f, i) => (
              <div key={i} className={styles.fileItem}>
                <span className={styles.fileName}>{f.name}</span>
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removeFile(i)}
                  aria-label="Remove file"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {needsPassword && (
          <div className={styles.extra}>
            <label>
              {tool.slug === 'protect-pdf' ? 'Password' : 'PDF Password'}
              <input
                type="password"
                value={extra.password || ''}
                onChange={(e) => setExtra((p) => ({ ...p, password: e.target.value }))}
                placeholder={tool.slug === 'protect-pdf' ? 'Set password' : 'Enter password'}
                className={styles.input}
              />
            </label>
            {showPassword && (
              <label>
                Confirm password
                <input
                  type="password"
                  value={extra.confirmPassword || ''}
                  onChange={(e) => setExtra((p) => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="Confirm password"
                  className={styles.input}
                />
              </label>
            )}
          </div>
        )}

        {showPagesInput && (
          <div className={styles.extra}>
            <label>
              {tool.slug === 'extract-pages' ? 'Pages to extract (e.g. 1,3,5 or 1-5)' : 'Pages to delete (e.g. 2,5 or 3-6)'}
              <input
                type="text"
                value={extra.pages || ''}
                onChange={(e) => setExtra((p) => ({ ...p, pages: e.target.value }))}
                placeholder={tool.slug === 'extract-pages' ? '1,2,3' : '2,5'}
                className={styles.input}
              />
            </label>
          </div>
        )}

        {showOrderInput && (
          <div className={styles.extra}>
            <label>
              New page order (e.g. 3,1,2)
              <input
                type="text"
                value={extra.order || ''}
                onChange={(e) => setExtra((p) => ({ ...p, order: e.target.value }))}
                placeholder="3,1,2"
                className={styles.input}
              />
            </label>
          </div>
        )}

        {showWatermarkText && (
          <div className={styles.extra}>
            <label>
              Watermark text
              <input
                type="text"
                value={extra.text || 'DRAFT'}
                onChange={(e) => setExtra((p) => ({ ...p, text: e.target.value }))}
                placeholder="DRAFT"
                className={styles.input}
              />
            </label>
          </div>
        )}

        {showResizeSelect && (
          <div className={styles.extra}>
            <label>
              Page size
              <select
                value={extra.size || 'a4'}
                onChange={(e) => setExtra((p) => ({ ...p, size: e.target.value }))}
                className={styles.input}
              >
                <option value="a4">A4</option>
                <option value="letter">Letter</option>
                <option value="legal">Legal</option>
              </select>
            </label>
          </div>
        )}

        {(tool.slug === 'pdf-metadata' || tool.slug === 'metadata') && (
          <div className={styles.extra}>
            <label>
              Title (optional)
              <input
                type="text"
                value={extra.title || ''}
                onChange={(e) => setExtra((p) => ({ ...p, title: e.target.value }))}
                placeholder="Document title"
                className={styles.input}
              />
            </label>
            <label>
              Author (optional)
              <input
                type="text"
                value={extra.author || ''}
                onChange={(e) => setExtra((p) => ({ ...p, author: e.target.value }))}
                placeholder="Author"
                className={styles.input}
              />
            </label>
          </div>
        )}

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={handleProcess}
            disabled={loading || !hasEnoughInput}
          >
            {loading ? 'Processing…' : `Run ${tool.name}`}
          </button>
        </div>

        {message && (
          <div className={styles.result}>
            <p className={styles.resultLabel}>Result</p>
            <p className={styles.messageText}>{message}</p>
          </div>
        )}

        {result && (
          <div className={styles.result}>
            <p className={styles.resultLabel}>
              {result.url ? 'Ready to download' : 'Downloaded'}
            </p>
            {result.url ? (
              <a href={result.url} download={result.filename} className={styles.downloadBtn}>
                Download {result.filename}
              </a>
            ) : (
              <span className={styles.downloadBtn}>{result.filename}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
