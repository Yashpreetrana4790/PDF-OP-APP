'use client';

import { useCallback, useState } from 'react';
import styles from './FileDropZone.module.css';

interface FileDropZoneProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  label?: string;
}

export default function FileDropZone({
  onFiles,
  accept = '.pdf',
  multiple = true,
  maxFiles = 10,
  label = 'Drag and drop your files here, or click to browse',
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAndEmit = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return;
      setError(null);
      const list = Array.from(files);
      if (list.length > maxFiles) {
        setError(`Maximum ${maxFiles} files allowed.`);
        return;
      }
      onFiles(list);
    },
    [onFiles, maxFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      validateAndEmit(e.dataTransfer.files);
    },
    [validateAndEmit]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      validateAndEmit(e.target.files);
      e.target.value = '';
    },
    [validateAndEmit]
  );

  return (
    <div className={styles.wrap}>
      <div
        className={`${styles.zone} ${isDragging ? styles.zoneActive : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className={styles.input}
          id="file-drop-input"
        />
        <label htmlFor="file-drop-input" className={styles.label}>
          <span className={styles.icon}>📁</span>
          <span className={styles.text}>{label}</span>
        </label>
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
