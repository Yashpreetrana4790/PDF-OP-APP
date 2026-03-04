export interface Tool {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: 'merge-split' | 'convert' | 'security' | 'other' | 'extract';
  apiRoute: string;
}

export const TOOLS: Tool[] = [
  { id: '1', slug: 'merge-pdf', name: 'Merge PDF', description: 'Combine multiple PDFs into one', icon: '📄', category: 'merge-split', apiRoute: '/api/merge' },
  { id: '2', slug: 'split-pdf', name: 'Split PDF', description: 'Split a PDF into multiple files', icon: '✂️', category: 'merge-split', apiRoute: '/api/split' },
  { id: '3', slug: 'compress-pdf', name: 'Compress PDF', description: 'Reduce PDF file size', icon: '🗜️', category: 'merge-split', apiRoute: '/api/compress' },
  { id: '4', slug: 'pdf-to-word', name: 'PDF to Word', description: 'Convert PDF to DOCX', icon: '📝', category: 'convert', apiRoute: '/api/pdf-to-word' },
  { id: '5', slug: 'pdf-to-excel', name: 'PDF to Excel', description: 'Convert PDF to XLSX', icon: '📊', category: 'convert', apiRoute: '/api/pdf-to-excel' },
  { id: '6', slug: 'pdf-to-ppt', name: 'PDF to PowerPoint', description: 'Convert PDF to PPTX', icon: '📽️', category: 'convert', apiRoute: '/api/pdf-to-ppt' },
  { id: '7', slug: 'pdf-to-jpg', name: 'PDF to JPG', description: 'Convert PDF pages to images', icon: '🖼️', category: 'convert', apiRoute: '/api/pdf-to-jpg' },
  { id: '8', slug: 'word-to-pdf', name: 'Word to PDF', description: 'Convert DOCX to PDF', icon: '📄', category: 'convert', apiRoute: '/api/word-to-pdf' },
  { id: '9', slug: 'excel-to-pdf', name: 'Excel to PDF', description: 'Convert XLSX to PDF', icon: '📄', category: 'convert', apiRoute: '/api/excel-to-pdf' },
  { id: '10', slug: 'ppt-to-pdf', name: 'PPT to PDF', description: 'Convert PowerPoint to PDF', icon: '📄', category: 'convert', apiRoute: '/api/ppt-to-pdf' },
  { id: '11', slug: 'jpg-to-pdf', name: 'JPG to PDF', description: 'Convert images to PDF', icon: '📄', category: 'convert', apiRoute: '/api/jpg-to-pdf' },
  { id: '12', slug: 'protect-pdf', name: 'Protect PDF', description: 'Add password to PDF', icon: '🔒', category: 'security', apiRoute: '/api/protect' },
  { id: '13', slug: 'unlock-pdf', name: 'Unlock PDF', description: 'Remove PDF password', icon: '🔓', category: 'security', apiRoute: '/api/unlock' },
  { id: '14', slug: 'ocr-pdf', name: 'OCR PDF', description: 'Extract text from scanned PDFs', icon: '🔍', category: 'other', apiRoute: '/api/ocr' },
  { id: '15', slug: 'compare-pdf', name: 'Compare PDF', description: 'Compare two PDFs', icon: '⚖️', category: 'other', apiRoute: '/api/compare' },
  { id: '16', slug: 'repair-pdf', name: 'Repair PDF', description: 'Fix corrupted PDF files', icon: '🔧', category: 'other', apiRoute: '/api/repair' },
  { id: '17', slug: 'hindi-font-converter', name: 'Hindi Font Converter', description: 'Convert Hindi text in PDF', icon: '🔄', category: 'other', apiRoute: '/api/hindi-font' },
  { id: '18', slug: 'speech-to-pdf', name: 'Speech to PDF', description: 'Transcribe speech and export to PDF', icon: '🎤', category: 'other', apiRoute: '/api/speech-to-pdf' },
  { id: '19', slug: 'rotate-pdf', name: 'Rotate PDF', description: 'Rotate PDF pages', icon: '🔄', category: 'merge-split', apiRoute: '/api/rotate' },
  { id: '20', slug: 'extract-pages', name: 'Extract Pages', description: 'Extract specific pages', icon: '📑', category: 'extract', apiRoute: '/api/extract-pages' },
  { id: '21', slug: 'reorder-pdf', name: 'Reorder PDF', description: 'Reorder PDF pages', icon: '📋', category: 'merge-split', apiRoute: '/api/reorder' },
  { id: '22', slug: 'add-watermark', name: 'Add Watermark', description: 'Add text or image watermark', icon: '💧', category: 'other', apiRoute: '/api/watermark' },
  { id: '23', slug: 'number-pages', name: 'Number Pages', description: 'Add page numbers to PDF', icon: '#️⃣', category: 'other', apiRoute: '/api/number-pages' },
  { id: '24', slug: 'pdf-to-text', name: 'PDF to Text', description: 'Extract text from PDF', icon: '📃', category: 'extract', apiRoute: '/api/pdf-to-text' },
  { id: '25', slug: 'text-to-pdf', name: 'Text to PDF', description: 'Create PDF from text', icon: '📄', category: 'convert', apiRoute: '/api/text-to-pdf' },
  { id: '26', slug: 'delete-pages', name: 'Delete Pages', description: 'Remove pages from PDF', icon: '🗑️', category: 'merge-split', apiRoute: '/api/delete-pages' },
  { id: '27', slug: 'organize-pdf', name: 'Organize PDF', description: 'Organize and arrange pages', icon: '📁', category: 'merge-split', apiRoute: '/api/organize' },
  { id: '28', slug: 'resize-pdf', name: 'Resize PDF', description: 'Change PDF page size', icon: '📐', category: 'other', apiRoute: '/api/resize' },
  { id: '29', slug: 'flatten-pdf', name: 'Flatten PDF', description: 'Flatten form fields and annotations', icon: '📋', category: 'other', apiRoute: '/api/flatten' },
  { id: '30', slug: 'pdf-metadata', name: 'PDF Metadata', description: 'View or edit PDF metadata', icon: '📋', category: 'extract', apiRoute: '/api/metadata' },
];

export const CATEGORIES = [
  { id: 'merge-split', label: 'Merge & Split' },
  { id: 'convert', label: 'Convert' },
  { id: 'security', label: 'Security' },
  { id: 'extract', label: 'Extract' },
  { id: 'other', label: 'Other' },
] as const;
