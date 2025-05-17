
import * as pdfjsLib from 'pdfjs-dist';
import { supabase } from './supabase';

// Configure PDF.js worker properly
import { GlobalWorkerOptions } from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.entry';

// Set the worker source correctly
GlobalWorkerOptions.workerSrc = pdfjsLib.GlobalWorkerOptions.workerSrc;

// Type definitions
interface PDFCheckResult {
  processable: boolean;
  reason?: string;
}

interface SummaryResponse {
  summary: string;
  fileDetails?: any;
}

// Check if PDF is processable
export const checkPDFProcessable = async (file: File): Promise<PDFCheckResult> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument(arrayBuffer);
    const pdfDoc = await loadingTask.promise;
    
    const numPages = pdfDoc.numPages;
    
    if (numPages === 0) {
      return {
        processable: false,
        reason: "PDF has no pages to process"
      };
    }
    
    const page = await pdfDoc.getPage(1);
    const textContent = await page.getTextContent();
    
    if (!textContent.items.length) {
      return {
        processable: false,
        reason: "No text could be extracted from this PDF. It may be a scanned document or image-based PDF."
      };
    }
    
    return { processable: true };
  } catch (error) {
    console.error("Error checking PDF:", error);
    return {
      processable: false,
      reason: error instanceof Error ? error.message : "Unknown error checking PDF"
    };
  }
};

// Upload file to Supabase storage
export const uploadFile = async (userId: string, file: File, folder: string = 'files') => {
  try {
    const filePath = `${userId}/${folder}/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('summaries')
      .upload(filePath, file);

    if (error) throw error;

    const fileUrl = supabase.storage
      .from('summaries')
      .getPublicUrl(filePath).data.publicUrl;

    return {
      filePath,
      fileUrl,
      fileName: file.name,
      contentType: file.type,
      size: file.size
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Store summary in Supabase
export const saveSummary = async (userId: string, summary: string, fileName: string, fileUrl: string) => {
  try {
    const { data, error } = await supabase
      .from('summaries')
      .insert([{
        user_id: userId,
        title: fileName.replace(/\.[^/.]+$/, ""),
        content: summary,
        file_name: fileName,
        file_url: fileUrl
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving summary:', error);
    throw error;
  }
};

// Main function to extract text and get summary
export const fetchJinaSummary = async (file: File): Promise<string | SummaryResponse> => {
  try {
    console.log("Starting text extraction from PDF");
    const text = await extractTextFromPDF(file);
    
    console.log("Extracted text preview:", text.substring(0, 300) + "...");
    
    if (!text || text.trim().length < 50) {
      return `Error: Could not extract sufficient text from the PDF. The document may be image-based or encrypted.`;
    }
    
    console.log("Getting summary from Jina API");
    const result = await getSummaryFromJina(text);
    return result;
  } catch (error) {
    console.error("Error in fetchJinaSummary:", error);
    return `Error: ${error instanceof Error ? error.message : "Unknown error processing PDF"}`;
  }
};

// Extract text from PDF
const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      const textItems = textContent.items.map((item: any) => {
        return item.str;
      });
      
      fullText += textItems.join(' ') + '\n';
    }
    
    return fullText;
  } catch (error) {
    console.error("PDF text extraction error:", error);
    throw new Error(`Failed to extract text: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};

// Get summary from Jina
const getSummaryFromJina = async (text: string): Promise<SummaryResponse> => {
  try {
    const prompt = `
      Summarize the following text comprehensively. 
      Include key points, main ideas, and important details.
      Present the summary in a well-structured format with clear paragraphs.
      
      Text to summarize:
      ${text.substring(0, 10000)}
    `;
    
    const apiUrl = 'https://api.jina.ai/v1/chat/completions';
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_JINA_API_KEY || ''}`
        },
        body: JSON.stringify({
          model: 'jina-summary-model',
          messages: [
            { role: 'system', content: 'You are a helpful summarization assistant.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 1000
        }),
        signal: AbortSignal.timeout(15000)
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          summary: data.choices[0].message.content,
        };
      } else {
        console.error("Jina API request failed, using fallback summary");
        return getFallbackSummary(text);
      }
    } catch (error) {
      console.error("Error calling Jina API, using fallback:", error);
      return getFallbackSummary(text);
    }
  } catch (error) {
    console.error("Summary API error:", error);
    throw new Error(`Failed to generate summary: ${error instanceof Error ? error.message : "Unknown API error"}`);
  }
};

// Fallback summarization function
export const getFallbackSummary = (text: string): SummaryResponse => {
  const sentences = text
    .replace(/([.?!])\s*(?=[A-Z])/g, "$1|")
    .split("|")
    .filter(sentence => sentence.trim().length > 20);
  
  const summaryLength = Math.min(10, Math.ceil(sentences.length / 5));
  const step = Math.max(1, Math.floor(sentences.length / summaryLength));
  
  let selectedSentences = [];
  for (let i = 0; i < sentences.length && selectedSentences.length < summaryLength; i += step) {
    if (sentences[i] && sentences[i].length > 30) {
      selectedSentences.push(sentences[i]);
    }
  }
  
  if (selectedSentences.length < summaryLength && sentences.length > summaryLength) {
    for (let i = 0; i < sentences.length && selectedSentences.length < summaryLength; i++) {
      if (!selectedSentences.includes(sentences[i])) {
        selectedSentences.push(sentences[i]);
      }
    }
  }
  
  const summary = "Summary (generated offline):\n\n" + selectedSentences.join(' ');
  
  return { summary };
};
