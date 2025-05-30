
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
  metadata?: {
    pages: number;
    hasText: boolean;
    fileSize: number;
    title?: string;
  };
}

interface SummaryResponse {
  summary: string;
  metadata?: {
    wordCount: number;
    readingTime: number;
    confidence: 'high' | 'medium' | 'low';
    extractedPages: number;
    summaryType: 'ai' | 'fallback';
  };
  fileDetails?: any;
}

interface SummaryOptions {
  length: 'brief' | 'detailed' | 'comprehensive';
  focus: 'study' | 'general' | 'technical';
  includeKeyPoints: boolean;
  includeCodeExamples: boolean;
}

// Enhanced PDF checking with detailed metadata
export const checkPDFProcessable = async (file: File): Promise<PDFCheckResult> => {
  try {
    console.log(`🔍 Analyzing PDF: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument(arrayBuffer);
    const pdfDoc = await loadingTask.promise;
    
    const numPages = pdfDoc.numPages;
    const metadata = await pdfDoc.getMetadata();
    
    console.log(`📄 PDF has ${numPages} pages`);
    
    if (numPages === 0) {
      return {
        processable: false,
        reason: "PDF has no pages to process"
      };
    }

    // Check multiple pages for text content
    let hasTextContent = false;
    let textSampleLength = 0;
    
    for (let i = 1; i <= Math.min(3, numPages); i++) {
      try {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        
        if (textContent.items.length > 0) {
          hasTextContent = true;
          textSampleLength += textContent.items.reduce((sum, item: any) => sum + item.str.length, 0);
        }
      } catch (pageError) {
        console.warn(`⚠️ Could not process page ${i}:`, pageError);
      }
    }
    
    if (!hasTextContent) {
      return {
        processable: false,
        reason: "No text could be extracted from this PDF. It may be a scanned document or image-based PDF. Consider using OCR tools first."
      };
    }

    if (textSampleLength < 100) {
      return {
        processable: false,
        reason: "Very little text content found. The PDF may contain mostly images or have poor text extraction quality."
      };
    }
    
    return { 
      processable: true,
      metadata: {
        pages: numPages,
        hasText: hasTextContent,
        fileSize: file.size,
        title: metadata?.info?.Title || file.name
      }
    };
  } catch (error) {
    console.error("❌ Error checking PDF:", error);
    return {
      processable: false,
      reason: error instanceof Error ? error.message : "Unknown error checking PDF"
    };
  }
};

// Enhanced text extraction with better formatting preservation
const extractTextFromPDF = async (file: File, onProgress?: (progress: number) => void): Promise<string> => {
  try {
    console.log("📖 Starting enhanced text extraction...");
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    
    let fullText = '';
    const totalPages = pdf.numPages;
    
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Enhanced text extraction with positioning
        const textItems = textContent.items.map((item: any) => ({
          text: item.str,
          x: item.transform[4],
          y: item.transform[5],
          width: item.width,
          height: item.height,
          fontName: item.fontName
        }));
        
        // Sort by Y position (top to bottom), then X position (left to right)
        textItems.sort((a, b) => {
          const yDiff = Math.abs(a.y - b.y);
          if (yDiff < 5) { // Same line tolerance
            return a.x - b.x;
          }
          return b.y - a.y; // Higher Y values first (PDF coordinates are bottom-up)
        });
        
        // Group items by lines and add proper spacing
        let currentY = -1;
        let lineText = '';
        let pageText = '';
        
        for (const item of textItems) {
          if (currentY === -1 || Math.abs(item.y - currentY) > 5) {
            // New line
            if (lineText.trim()) {
              pageText += lineText.trim() + '\n';
            }
            lineText = item.text;
            currentY = item.y;
          } else {
            // Same line - add spacing if needed
            const needsSpace = lineText.length > 0 && 
                             !lineText.endsWith(' ') && 
                             !item.text.startsWith(' ') &&
                             !/^[.,!?;:]/.test(item.text);
            lineText += (needsSpace ? ' ' : '') + item.text;
          }
        }
        
        // Add the last line
        if (lineText.trim()) {
          pageText += lineText.trim() + '\n';
        }
        
        // Add page separator for multi-page documents
        if (pageNum > 1) {
          fullText += '\n--- Page ' + pageNum + ' ---\n';
        }
        fullText += pageText;
        
        // Update progress
        if (onProgress) {
          onProgress(Math.round((pageNum / totalPages) * 70)); // 70% for extraction
        }
        
        console.log(`✅ Processed page ${pageNum}/${totalPages}`);
        
      } catch (pageError) {
        console.warn(`⚠️ Error processing page ${pageNum}:`, pageError);
        fullText += `\n[Error processing page ${pageNum}]\n`;
      }
    }
    
    // Clean up the text
    fullText = fullText
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive line breaks
      .trim();
    
    console.log(`📝 Extracted ${fullText.length} characters from ${totalPages} pages`);
    return fullText;
    
  } catch (error) {
    console.error("❌ PDF text extraction error:", error);
    throw new Error(`Failed to extract text: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};

// Enhanced summary generation with better prompts
const getSummaryFromJina = async (text: string, options: SummaryOptions = {
  length: 'detailed',
  focus: 'study',
  includeKeyPoints: true,
  includeCodeExamples: true
}): Promise<SummaryResponse> => {
  try {
    console.log("🤖 Generating AI summary with options:", options);
    
    const wordCount = text.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200); // Average reading speed
    
    // Enhanced prompt based on options
    const lengthInstructions = {
      brief: "Create a concise summary in 2-3 paragraphs focusing on the most essential points.",
      detailed: "Create a comprehensive summary with main sections, key concepts, and important details.",
      comprehensive: "Create an extensive summary covering all major topics, subtopics, and supporting details."
    };
    
    const focusInstructions = {
      study: "Structure this as study material with clear learning objectives, key concepts to remember, and practical applications.",
      general: "Provide a general overview suitable for quick understanding of the main topics.",
      technical: "Focus on technical details, methodologies, code examples, and implementation specifics."
    };
    
    let prompt = `As an expert academic summarizer, please analyze and summarize the following document.

${lengthInstructions[options.length]}
${focusInstructions[options.focus]}

Additional requirements:
${options.includeKeyPoints ? '- Include a "Key Takeaways" section with bullet points\n' : ''}
${options.includeCodeExamples ? '- Preserve and explain any code examples or technical implementations\n' : ''}
- Use clear headings and subheadings
- Maintain logical flow and structure
- Include specific details and examples where relevant

Document to summarize:
${text.substring(0, 15000)}`; // Increased token limit
    
    const apiUrl = 'https://api.jina.ai/v1/chat/completions';
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_JINA_API_KEY || ''}`
        },
        body: JSON.stringify({
          model: 'jina-embeddings-v2-base-en', // Updated model
          messages: [
            { 
              role: 'system', 
              content: 'You are an expert academic summarizer specializing in educational content. Create well-structured, comprehensive summaries that help students learn effectively.' 
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2, // Lower for more focused summaries
          max_tokens: options.length === 'comprehensive' ? 2000 : options.length === 'detailed' ? 1500 : 800,
          top_p: 0.9
        }),
        signal: AbortSignal.timeout(30000) // Increased timeout
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("✅ AI summary generated successfully");
        return {
          summary: data.choices[0].message.content,
          metadata: {
            wordCount,
            readingTime,
            confidence: 'high',
            extractedPages: text.split('--- Page').length,
            summaryType: 'ai'
          }
        };
      } else {
        console.warn("⚠️ Jina API request failed, using enhanced fallback");
        return getEnhancedFallbackSummary(text, options);
      }
    } catch (apiError) {
      console.warn("⚠️ Error calling Jina API, using enhanced fallback:", apiError);
      return getEnhancedFallbackSummary(text, options);
    }
  } catch (error) {
    console.error("❌ Summary generation error:", error);
    throw new Error(`Failed to generate summary: ${error instanceof Error ? error.message : "Unknown API error"}`);
  }
};

// Enhanced fallback summarization
export const getEnhancedFallbackSummary = (text: string, options: SummaryOptions): SummaryResponse => {
  console.log("🔄 Generating enhanced fallback summary...");
  
  const wordCount = text.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);
  
  // Better sentence detection
  const sentences = text
    .replace(/([.!?])\s*(?=[A-Z])/g, "$1|SPLIT|")
    .split("|SPLIT|")
    .map(s => s.trim())
    .filter(sentence => sentence.length > 30 && sentence.length < 300);
  
  // Extract key sentences based on indicators
  const keywordIndicators = [
    'important', 'key', 'main', 'primary', 'essential', 'fundamental',
    'chapter', 'section', 'introduction', 'conclusion', 'summary',
    'definition', 'example', 'method', 'process', 'feature'
  ];
  
  const scoredSentences = sentences.map(sentence => {
    let score = 0;
    const lowerSentence = sentence.toLowerCase();
    
    // Score based on keywords
    keywordIndicators.forEach(keyword => {
      if (lowerSentence.includes(keyword)) score += 2;
    });
    
    // Prefer sentences with numbers or lists
    if (/\d+\.|\d+\)|\d+:/.test(sentence)) score += 1;
    
    // Prefer sentences with technical terms
    if (/[A-Z][a-z]*[A-Z]/.test(sentence) || sentence.includes('()')) score += 1;
    
    // Avoid very short or very long sentences
    if (sentence.length > 50 && sentence.length < 150) score += 1;
    
    return { sentence, score };
  });
  
  // Sort by score and select top sentences
  scoredSentences.sort((a, b) => b.score - a.score);
  
  const summaryLength = options.length === 'brief' ? 5 : 
                       options.length === 'detailed' ? 12 : 20;
  
  const selectedSentences = scoredSentences
    .slice(0, summaryLength)
    .map(item => item.sentence);
  
  // Structure the summary
  let summary = "## Document Summary (Generated Offline)\n\n";
  
  if (options.focus === 'study') {
    summary += "### Key Learning Points:\n";
    selectedSentences.forEach((sentence, index) => {
      summary += `${index + 1}. ${sentence}\n\n`;
    });
  } else {
    summary += selectedSentences.join(' ');
  }
  
  if (options.includeKeyPoints) {
    const keyPoints = selectedSentences.slice(0, 5).map(s => 
      s.split('.')[0] + (s.includes('.') ? '.' : '')
    );
    summary += "\n### Key Takeaways:\n";
    keyPoints.forEach(point => {
      summary += `• ${point}\n`;
    });
  }
  
  return { 
    summary,
    metadata: {
      wordCount,
      readingTime,
      confidence: 'medium',
      extractedPages: text.split('--- Page').length,
      summaryType: 'fallback'
    }
  };
};

// Main function with enhanced progress tracking
export const fetchJinaSummary = async (
  file: File, 
  options: SummaryOptions = {
    length: 'detailed',
    focus: 'study',
    includeKeyPoints: true,
    includeCodeExamples: true
  },
  onProgress?: (progress: number) => void
): Promise<string | SummaryResponse> => {
  try {
    console.log("🚀 Starting enhanced PDF processing");
    
    if (onProgress) onProgress(5);
    
    // Check PDF first
    const checkResult = await checkPDFProcessable(file);
    if (!checkResult.processable) {
      throw new Error(checkResult.reason || "PDF not processable");
    }
    
    if (onProgress) onProgress(10);
    
    console.log("📖 Extracting text with enhanced algorithm");
    const text = await extractTextFromPDF(file, onProgress);
    
    if (onProgress) onProgress(80);
    
    if (!text || text.trim().length < 100) {
      throw new Error("Could not extract sufficient text from the PDF. The document may be image-based, encrypted, or have very little content.");
    }
    
    console.log("🤖 Generating intelligent summary");
    const result = await getSummaryFromJina(text, options);
    
    if (onProgress) onProgress(100);
    
    console.log("✅ PDF processing completed successfully");
    return result;
    
  } catch (error) {
    console.error("❌ Error in fetchJinaSummary:", error);
    return `Error: ${error instanceof Error ? error.message : "Unknown error processing PDF"}`;
  }
};

// Upload file to Supabase storage with progress
export const uploadFileToStorage = async (
  userId: string, 
  file: File, 
  bucket: string = 'study_materials',
  onProgress?: (progress: number) => void
) => {
  try {
    console.log("☁️ Uploading file to storage...");
    
    const filePath = `${userId}/${Date.now()}_${file.name}`;
    
    if (onProgress) onProgress(10);
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    if (onProgress) onProgress(80);

    const fileUrl = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath).data.publicUrl;

    if (onProgress) onProgress(100);

    console.log("✅ File uploaded successfully");
    return {
      filePath,
      fileUrl,
      fileName: file.name,
      contentType: file.type,
      size: file.size
    };
  } catch (error) {
    console.error('❌ Error uploading file:', error);
    throw error;
  }
};

// Enhanced summary storage with metadata
export const storeSummary = async (
  userId: string, 
  summary: string, 
  fileName: string, 
  fileUrl: string,
  metadata?: any
) => {
  try {
    console.log("💾 Storing summary in database...");
    
    const { data, error } = await supabase
      .from('study_materials')
      .insert([{
        user_id: userId,
        title: fileName.replace(/\.[^/.]+$/, ""),
        summary,
        file_name: fileName,
        file_url: fileUrl,
        metadata: metadata || {},
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    
    console.log("✅ Summary stored successfully");
    return data;
  } catch (error) {
    console.error('❌ Error saving summary:', error);
    throw error;
  }
};
