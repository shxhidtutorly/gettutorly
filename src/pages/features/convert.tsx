"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Upload, Download, FileZip, AlertCircle, CheckCircle, ArrowRight, X } from "lucide-react"
import Link from "next/link"
import { useState, useRef, useCallback, useEffect } from "react"
import Navbar from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useDropzone } from "react-dropzone"
import { Progress } from "@/components/ui/progress"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Slider } from "@/components/ui/slider"

// Utility function to download files
function downloadBlob(blob: Blob, filename: string) {
  if (typeof window === 'undefined') return;
  if ((window as any).navigator?.msSaveOrOpenBlob) {
    (window as any).navigator.msSaveOrOpenBlob(blob, filename);
    return;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Format file size in human-readable format
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function ConvertPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [outputFormat, setOutputFormat] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [quality, setQuality] = useState(80); // Default quality for PDF/image compression
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Reset output format when files change
  useEffect(() => {
    if (files.length === 0) {
      setOutputFormat("");
    }
  }, [files]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/markdown': ['.md'],
      'text/plain': ['.txt'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp']
    },
    maxSize: 150 * 1024 * 1024, // 150MB max size
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
  };

  const handleConvert = async () => {
    if (files.length === 0 || !outputFormat) {
      setError("Please select files and an output format");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setLogs([]);
    setError(null);

    // Create a new AbortController for this conversion
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      addLog(`Starting conversion to ${outputFormat.toUpperCase()}...`);
      
      // Simulate processing with progress updates
      // In a real implementation, this would be replaced with actual conversion logic
      for (let i = 0; i <= 100; i += 10) {
        if (signal.aborted) {
          throw new Error("Conversion cancelled");
        }
        
        setProgress(i);
        addLog(`Processing: ${i}% complete`);
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Simulate successful conversion
      const blob = new Blob(["Converted file content"], { type: "text/plain" });
      const filename = `converted-file.${outputFormat.toLowerCase()}`;
      
      addLog(`Conversion complete! Downloading ${filename}...`);
      downloadBlob(blob, filename);
      
      setProgress(100);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        addLog(`Error: ${err.message}`);
      } else {
        setError("An unknown error occurred");
        addLog("An unknown error occurred");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelConversion = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      addLog("Conversion cancelled by user");
    }
  };

  // Determine available output formats based on input files
  const getAvailableOutputFormats = () => {
    if (files.length === 0) return [];
    
    const inputTypes = files.map(file => file.type);
    
    // Common formats available for most inputs
    const commonFormats = ['pdf', 'txt'];
    
    // Special formats based on input types
    if (inputTypes.some(type => type.includes('word') || type.includes('text'))) {
      return [...commonFormats, 'docx', 'md'];
    }
    
    if (inputTypes.some(type => type.includes('pdf'))) {
      return [...commonFormats, 'jpg', 'png'];
    }
    
    if (inputTypes.some(type => type.includes('image'))) {
      return [...commonFormats, 'jpg', 'png', 'webp', 'pptx'];
    }
    
    return commonFormats;
  };

  const convertFaqs = [
    {
      question: "What file formats can I convert?",
      answer: "Our Convert tool supports conversion between DOCX, PDF, Markdown, TXT, and various image formats (PNG, JPG, WEBP). You can also create PPTX presentations from images."
    },
    {
      question: "Is there a file size limit?",
      answer: "Yes, the maximum file size is 150MB per file. For larger files, we recommend splitting them into smaller parts or using a desktop application."
    },
    {
      question: "How accurate is the conversion?",
      answer: "Conversion accuracy depends on the formats involved. Text-based conversions (DOCX, TXT, MD) typically maintain high fidelity, while PDF conversions may have some formatting differences due to the complexity of PDF structures."
    },
    {
      question: "Are my files secure?",
      answer: "Yes! All processing happens locally in your browser. Your files never leave your device or get uploaded to any server."
    },
  ];

  const otherFeatures = [
    { name: "Math Chat", href: "/features/math-chat", desc: "Solve problems with step-by-step help" },
    { name: "AI Notes", href: "/features/ai-notes", desc: "Generate smart notes from any content" },
    { name: "Compress", href: "/features/compress", desc: "Compress files and PDFs" },
    { name: "Flashcards", href: "/features/flashcard", desc: "Create adaptive study cards" },
    { name: "Tests & Quizzes", href: "/features/tests-quiz", desc: "Generate practice tests" },
    { name: "Summarizer", href: "/features/summaries", desc: "Summarize any document" },
  ];

  return (
    <div className="min-h-screen bg-white text-black font-mono">
      <Navbar />

      {/* Hero Section */}
      <section className="feature-hero py-20 md:py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center space-y-8 scroll-fade-in">
            <div className="flex justify-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center brutal-border floating">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div
                className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center brutal-border floating"
                style={{ animationDelay: "0.5s" }}
              >
                <Upload className="w-8 h-8 text-white" />
              </div>
              <div
                className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center brutal-border floating"
                style={{ animationDelay: "1s" }}
              >
                <Download className="w-8 h-8 text-white" />
              </div>
            </div>

            <Badge className="bg-blue-600 text-white font-black text-lg px-6 py-3 brutal-border">
              🔄 FILE CONVERTER
            </Badge>

            <h1 className="text-5xl md:text-7xl font-black leading-none text-black">Convert</h1>

            <p className="text-2xl md:text-3xl font-bold text-black-700 max-w-4xl mx-auto">
              Convert between DOCX, PDF, Markdown, TXT, and images - all in your browser!
            </p>

            <div className="flex items-center justify-center space-x-4 bg-yellow-100 px-6 py-3 rounded-full brutal-border">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="font-black text-lg">100% private - files never leave your device</span>
            </div>
          </div>
        </div>
      </section>

      {/* Converter Tool Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-4">Convert Your Files</h2>
            <p className="text-xl font-bold">Drop files, select output format, and convert!</p>
          </div>

          <div className="bg-white p-6 rounded-xl brutal-border mb-8">
            {/* Dropzone */}
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed ${isDragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300'} 
                rounded-lg p-8 text-center cursor-pointer mb-6 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                transition-colors duration-200 ease-in-out`}
              role="button"
              tabIndex={0}
              aria-label="Drop files here"
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-bold">
                {isDragActive
                  ? "Drop the files here..."
                  : "Drag & drop files here, or click to select files"}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Supports .docx, .pdf, .md, .txt, .png, .jpg, .jpeg, .webp
              </p>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-3">Selected Files</h3>
                <div className="space-y-3">
                  {files.map((file, index) => (
                    <Card key={index} className="p-4 flex justify-between items-center">
                      <div>
                        <p className="font-bold truncate">{file.name}</p>
                        <p className="text-sm text-gray-500">{file.type || 'Unknown type'} • {formatFileSize(file.size)}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeFile(index)}
                        aria-label="Remove file"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Conversion Options */}
            {files.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-3">Conversion Options</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Output Format</label>
                    <Select value={outputFormat} onValueChange={setOutputFormat}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableOutputFormats().map(format => (
                          <SelectItem key={format} value={format}>
                            {format.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quality slider for image/PDF outputs */}
                  {outputFormat && ['pdf', 'jpg', 'jpeg', 'png', 'webp'].includes(outputFormat) && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Quality: {quality}%
                      </label>
                      <Slider
                        value={[quality]}
                        min={10}
                        max={100}
                        step={5}
                        onValueChange={(value) => setQuality(value[0])}
                        className="py-2"
                      />
                    </div>
                  )}
                </div>

                {/* Conversion fidelity warning */}
                {outputFormat && (
                  <Alert className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Conversion Note</AlertTitle>
                    <AlertDescription>
                      {outputFormat === 'pdf' 
                        ? 'PDF conversion renders content as it appears visually. Some interactive elements may be flattened.'
                        : outputFormat === 'docx'
                        ? 'DOCX conversion preserves text and basic formatting. Complex layouts may differ from the original.'
                        : 'Conversion between formats may not preserve all formatting and features of the original file.'}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleConvert}
                disabled={isProcessing || files.length === 0 || !outputFormat}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 brutal-button"
              >
                {isProcessing ? 'Converting...' : 'Convert Now'}
              </Button>
              
              {isProcessing && (
                <Button
                  onClick={cancelConversion}
                  variant="outline"
                  className="font-bold brutal-border"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>

          {/* Progress and Logs */}
          {(isProcessing || logs.length > 0) && (
            <div className="bg-white p-6 rounded-xl brutal-border mb-8">
              <h3 className="font-bold text-lg mb-3">Conversion Progress</h3>
              
              {isProcessing && (
                <div className="mb-4">
                  <Progress value={progress} className="h-2 mb-2" />
                  <p className="text-sm font-medium text-right">{progress}%</p>
                </div>
              )}
              
              <div 
                className="bg-gray-50 p-4 rounded-md font-mono text-sm h-40 overflow-y-auto" 
                aria-live="polite"
              >
                {logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
                  </div>
                ))}
                {error && (
                  <div className="text-red-500 font-bold">
                    <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> Error: {error}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="text-center mt-8 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm font-medium">
              <span className="font-bold">Privacy Note:</span> All processing happens locally in your browser. Files never leave your device.
            </p>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-4xl font-black text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            {convertFaqs.map((faq, index) => (
              <div 
                key={index} 
                className="border-2 border-black rounded-lg overflow-hidden brutal-border"
              >
                <button
                  className="w-full px-6 py-4 text-left font-bold text-lg flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-inset"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  aria-expanded={openFaq === index}
                  aria-controls={`faq-answer-${index}`}
                >
                  {faq.question}
                  {openFaq === index ? (
                    <Minus className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <Plus className="w-5 h-5 flex-shrink-0" />
                  )}
                </button>
                
                {openFaq === index && (
                  <div 
                    id={`faq-answer-${index}`}
                    className="px-6 py-4 bg-gray-50"
                  >
                    <p className="text-lg">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore Other Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-black text-center mb-12">Explore Other Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherFeatures.map((feature, index) => (
              <Link 
                key={index} 
                href={feature.href}
                className="bg-white p-6 rounded-xl brutal-border hover:shadow-lg transition-shadow duration-200"
              >
                <h3 className="text-xl font-bold mb-2">{feature.name}</h3>
                <p className="text-gray-700 mb-4">{feature.desc}</p>
                <div className="flex items-center text-purple-600 font-bold">
                  <span>Learn more</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Universities Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-black mb-8">TRUSTED BY STUDENTS FROM</h2>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            <div className="w-32 h-16 bg-gray-200 rounded flex items-center justify-center brutal-border">Harvard</div>
            <div className="w-32 h-16 bg-gray-200 rounded flex items-center justify-center brutal-border">Stanford</div>
            <div className="w-32 h-16 bg-gray-200 rounded flex items-center justify-center brutal-border">MIT</div>
            <div className="w-32 h-16 bg-gray-200 rounded flex items-center justify-center brutal-border">Oxford</div>
            <div className="w-32 h-16 bg-gray-200 rounded flex items-center justify-center brutal-border">Cambridge</div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
