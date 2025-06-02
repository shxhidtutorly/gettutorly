
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

// Set up PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url
  ).toString();
}

export interface ExtractionResult {
  text: string;
  filename: string;
  fileType: string;
}

export async function extractTextFromFile(file: File): Promise<ExtractionResult> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'pdf':
      return await extractPDF(file);
    case 'docx':
      return await extractDOCX(file);
    case 'txt':
    case 'md':
      return await extractTextFile(file);
    case 'html':
      return await extractHTML(file);
    default:
      throw new Error(`Unsupported file format: ${ext}`);
  }
}

async function extractPDF(file: File): Promise<ExtractionResult> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  let fullText = "";

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(" ");
    fullText += pageText + "\n";
  }

  return {
    text: fullText,
    filename: file.name,
    fileType: 'pdf'
  };
}

async function extractDOCX(file: File): Promise<ExtractionResult> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  
  return {
    text: result.value,
    filename: file.name,
    fileType: 'docx'
  };
}

async function extractTextFile(file: File): Promise<ExtractionResult> {
  const text = await file.text();
  
  return {
    text,
    filename: file.name,
    fileType: 'text'
  };
}

async function extractHTML(file: File): Promise<ExtractionResult> {
  const htmlContent = await file.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  
  return {
    text: doc.body.textContent || '',
    filename: file.name,
    fileType: 'html'
  };
}
