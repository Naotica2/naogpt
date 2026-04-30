import type { FileAttachment } from '../types';

const TEXT_EXTENSIONS = new Set([
  'txt', 'md', 'csv', 'json', 'xml', 'yml', 'yaml',
  'js', 'ts', 'tsx', 'jsx', 'html', 'css', 'scss',
  'py', 'java', 'c', 'cpp', 'h', 'hpp', 'cs',
  'rb', 'go', 'rs', 'php', 'swift', 'kt', 'kts',
  'sh', 'bash', 'zsh', 'bat', 'ps1',
  'sql', 'graphql', 'gql',
  'toml', 'ini', 'cfg', 'conf', 'env',
  'log', 'gitignore', 'dockerignore', 'dockerfile',
  'makefile', 'gradle', 'properties',
  'svg', 'vue', 'svelte', 'astro',
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_TEXT_LENGTH = 50000; // ~50k chars to stay within token limits

function getExtension(filename: string): string {
  const parts = filename.toLowerCase().split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

function isTextFile(file: File): boolean {
  if (file.type.startsWith('text/')) return true;
  if (file.type === 'application/json') return true;
  if (file.type === 'application/xml') return true;
  if (file.type === 'application/javascript') return true;
  if (file.type === 'application/typescript') return true;
  return TEXT_EXTENSIONS.has(getExtension(file.name));
}

function isPdf(file: File): boolean {
  return file.type === 'application/pdf' || getExtension(file.name) === 'pdf';
}

async function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

async function readPdfFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfjsLib = await import('pdfjs-dist');
  
  // Set worker source
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    pages.push(pageText);
  }

  return pages.join('\n\n');
}

export function getSupportedFileTypes(): string {
  return [
    '.txt', '.md', '.csv', '.json', '.xml', '.yml', '.yaml',
    '.js', '.ts', '.tsx', '.jsx', '.html', '.css', '.scss',
    '.py', '.java', '.c', '.cpp', '.h', '.cs',
    '.rb', '.go', '.rs', '.php', '.swift', '.kt',
    '.sh', '.sql', '.toml', '.ini', '.env', '.log',
    '.svg', '.vue', '.svelte',
    '.pdf',
  ].join(',');
}

export function isFileSupported(file: File): boolean {
  return isTextFile(file) || isPdf(file);
}

export async function processFile(file: File): Promise<FileAttachment> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File terlalu besar (max ${MAX_FILE_SIZE / 1024 / 1024}MB)`);
  }

  if (!isFileSupported(file)) {
    throw new Error('Tipe file tidak didukung. Gunakan file teks, kode, atau PDF.');
  }

  let textContent: string;

  if (isPdf(file)) {
    textContent = await readPdfFile(file);
  } else {
    textContent = await readTextFile(file);
  }

  if (textContent.length > MAX_TEXT_LENGTH) {
    textContent = textContent.slice(0, MAX_TEXT_LENGTH) + '\n\n[... file terpotong karena terlalu panjang]';
  }

  return {
    name: file.name,
    type: file.type || 'text/plain',
    size: file.size,
    textContent,
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
