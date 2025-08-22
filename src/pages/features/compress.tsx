"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileZip, Upload, Download, FileText, AlertCircle, CheckCircle, ArrowRight, X } from "lucide-react"
import Link from "next/link"
import { useState, useRef, useCallback, useEffect } from "react"
import Navbar from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useDropzone } from "react-dropzone"
import { Progress } from "@/components/ui/progress"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Plus, Minus } from "lucide-react"

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

// Estimate compressed size (very rough estimate for UI purposes)
const estimateCompressedSize = (originalSize: number, compressionLevel: number, isPdf: boolean): number => {
  // For ZIP compression
  if (!isPdf) {
    // Higher compression level = better compression
    const compressionFactor = 0.9 - (compressionLevel * 0.05);
    return Math.max(originalSize * compressionFactor, originalSize * 0.3); // At least 30% of original
  }
  
  // For PDF compression (quality-based)
  else {
    // Lower quality = smaller file
    const qualityFactor = compressionLevel / 100;
    return Math.max(originalSize * qualityFactor, originalSize * 0.1); // At least 10% of original
  }
};

export default function CompressPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState("zip");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // ZIP compression options
  const [compressionLevel, setCompressionLevel] = useState(6); // 1-9 scale
  const [preserveFolders, setPreserveFolders] = useState(true);
  
  // PDF compression options
  const [pdfQuality, setPdfQuality] = useState(50); // 1-100 scale
  const [pdfMode, setPdfMode] = useState("lossy"); // lossy or lossless
  
  // Reset when tab changes
  useEffect(() => {
    setFiles([]);
    setError(null);
    setLogs([]);
    setProgress(0);
  }, [activeTab]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
    setError(null);
  }, []);

  // Different dropzone configurations based on active tab
  const zipDropzoneConfig = {
    onDrop,
    accept: {} as any, // Accept all file types for ZIP
    maxSize: 500 * 1024 * 1024, // 500MB max size for ZIP
  };

  const pdfDropzoneConfig = {
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxSize: 100 * 1024 * 1024, // 100MB max size for PDF
    multiple: false, // Only one PDF at a time
  };

  const { getRootProps: getZipRootProps, getInputProps: getZipInputProps, isDragActive: isZipDragActive } = 
    useDropzone(zipDropzoneConfig);
    
  const { getRootProps: getPdfRootProps, getInputProps: getPdfInputProps, isDragActive: isPdfDragActive } = 
    useDropzone(pdfDropzoneConfig);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
  };

  const handleCompress = async () => {
    if (files.length === 0) {
      setError("Please select files to compress");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setLogs([]);
    setError(null);

    // Create a new AbortController for this compression
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      if (activeTab === "zip") {
        addLog(`Starting ZIP compression at level ${compressionLevel}...`);
        addLog(`Preserving folder structure: ${preserveFolders ? 'Yes' : 'No'}`);
      } else {
        addLog(`Starting PDF compression with ${pdfMode} mode at quality ${pdfQuality}%...`);
      }
      
      // Simulate processing with progress updates
      // In a real implementation, this would be replaced with actual compression logic
      for (let i = 0; i <= 100; i += 10) {
        if (signal.aborted) {
          throw new Error("Compression cancelled");
        }
        
        setProgress(i);
        addLog(`Processing: ${i}% complete`);
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Simulate successful compression
      const blob = new Blob(["Compressed file content"], { type: "application/octet-stream" });
      const filename = activeTab === "zip" 
        ? "compressed-files.zip" 
        : "compressed-document.pdf";
      
      addLog(`Compression complete! Downloading ${filename}...`);
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

  const cancelCompression = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      addLog("Compression cancelled by user");
    }
  };

  // Calculate total file size
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  
  // Estimate compressed size
  const estimatedSize = activeTab === "zip"
    ? estimateCompressedSize(totalSize, compressionLevel, false)
    : estimateCompressedSize(totalSize, pdfQuality, true);

  const compressFaqs = [
    {
      question: "How much can files be compressed?",
      answer: "Compression rates vary by file type. Text files and PDFs with many images can often be compressed by 50-90%. Already compressed files like JPGs may only reduce by 5-10%."
    },
    {
      question: "What's the difference between lossy and lossless PDF compression?",
      answer: "Lossless compression preserves all content quality but offers modest file size reduction. Lossy compression achieves much smaller files by reducing image quality and resolution."
    },
    {
      question: "Is there a file size limit?",
      answer: "Yes, the maximum file size is 500MB for ZIP compression and 100MB for PDF compression. For larger files, we recommend compressing in smaller batches."
    },
    {
      question: "Are my files secure?",
      answer: "Yes! All processing happens locally in your browser. Your files never leave your device or get uploaded to any server."
    },
  ];

  const otherFeatures = [
    { name: "Math Chat", href: "/features/math-chat", desc: "Solve problems with step-by-step help" },
    { name: "AI Notes", href: "/features/ai-notes", desc: "Generate smart notes from any content" },
    { name: "Convert", href: "/features/convert", desc: "Convert between file formats" },
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
                <FileZip className="w-8 h-8 text-white" />
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
              📦 FILE COMPRESSOR
            </Badge>

            <h1 className="text-5xl md:text-7xl font-black leading-none text-black">Compress</h1>

            <p className="text-2xl md:text-3xl font-bold text-black-700 max-w-4xl mx-auto">
              Compress files to ZIP or reduce PDF size - all in your browser!
            </p>

            <div className="flex items-center justify-center space-x-4 bg-yellow-100 px-6 py-3 rounded-full brutal-border">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="font-black text-lg">100% private - files never leave your device</span>
            </div>
          </div>
        </div>
      </section>

      {/* Compressor Tool Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-4">Compress Your Files</h2>
            <p className="text-xl font-bold">Choose compression type, drop files, and compress!</p>
          </div>

          <Tabs defaultValue="zip" value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="zip" className="text-lg font-bold py-3">ZIP Compression</TabsTrigger>
              <TabsTrigger value="pdf" className="text-lg font-bold py-3">PDF Compression</TabsTrigger>
            </TabsList>
            
            <TabsContent value="zip" className="bg-white p-6 rounded-xl brutal-border">
              {/* ZIP Compression UI */}
              <div className="space-y-6">
                {/* Dropzone */}
                <div 
                  {...getZipRootProps()} 
                  className={`border-2 border-dashed ${isZipDragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300'} 
                    rounded-lg p-8 text-center cursor-pointer mb-6 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    transition-colors duration-200 ease-in-out`}
                  role="button"
                  tabIndex={0}
                  aria-label="Drop files here for ZIP compression"
                >
                  <input {...getZipInputProps()} />
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-bold">
                    {isZipDragActive
                      ? "Drop the files here..."
                      : "Drag & drop files here, or click to select files"}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Add any files to compress into a ZIP archive
                  </p>
                </div>

                {/* ZIP Compression Options */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg">Compression Options</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium">Compression Level: {compressionLevel}</label>
                        <span className="text-sm text-gray-500">
                          {compressionLevel <= 3 ? 'Faster' : compressionLevel >= 7 ? 'Smaller' : 'Balanced'}
                        </span>
                      </div>
                      <Slider
                        value={[compressionLevel]}
                        min={1}
                        max={9}
                        step={1}
                        onValueChange={(value) => setCompressionLevel(value[0])}
                        className="py-2"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="preserve-folders"
                        checked={preserveFolders}
                        onCheckedChange={setPreserveFolders}
                      />
                      <Label htmlFor="preserve-folders">Preserve folder structure</Label>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="pdf" className="bg-white p-6 rounded-xl brutal-border">
              {/* PDF Compression UI */}
              <div className="space-y-6">
                {/* Dropzone */}
                <div 
                  {...getPdfRootProps()} 
                  className={`border-2 border-dashed ${isPdfDragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300'} 
                    rounded-lg p-8 text-center cursor-pointer mb-6 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    transition-colors duration-200 ease-in-out`}
                  role="button"
                  tabIndex={0}
                  aria-label="Drop PDF here for compression"
                >
                  <input {...getPdfInputProps()} />
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-bold">
                    {isPdfDragActive
                      ? "Drop the PDF here..."
                      : "Drag & drop a PDF here, or click to select"}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Only PDF files are accepted for PDF compression
                  </p>
                </div>

                {/* PDF Compression Options */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg">Compression Options</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant={pdfMode === "lossless" ? "default" : "outline"}
                        onClick={() => setPdfMode("lossless")}
                        className="flex-1 font-bold"
                      >
                        Lossless
                        <span className="block text-xs font-normal mt-1">Preserve quality</span>
                      </Button>
                      <Button
                        variant={pdfMode === "lossy" ? "default" : "outline"}
                        onClick={() => setPdfMode("lossy")}
                        className="flex-1 font-bold"
                      >
                        Lossy
                        <span className="block text-xs font-normal mt-1">Reduce quality</span>
                      </Button>
                    </div>
                    
                    {pdfMode === "lossy" && (
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-sm font-medium">Image Quality: {pdfQuality}%</label>
                          <span className="text-sm text-gray-500">
                            {pdfQuality <= 30 ? 'Low' : pdfQuality >= 70 ? 'High' : 'Medium'}
                          </span>
                        </div>
                        <Slider
                          value={[pdfQuality]}
                          min={10}
                          max={90}
                          step={10}
                          onValueChange={(value) => setPdfQuality(value[0])}
                          className="py-2"
                        />
                      </div>
                    )}
                    
                    {pdfMode === "lossy" && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Lossy Compression Warning</AlertTitle>
                        <AlertDescription>
                          Lossy compression reduces file size by decreasing image quality and flattening text. 
                          This may affect searchability and text selection in the resulting PDF.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* File List */}
          {files.length > 0 && (
            <div className="bg-white p-6 rounded-xl brutal-border mb-8">
              <h3 className="font-bold text-lg mb-3">Selected Files</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
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
              
              {/* File Size Summary */}
              {files.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Size:</span>
                    <span className="font-bold">{formatFileSize(totalSize)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-medium">Estimated Compressed Size:</span>
                    <span className="font-bold text-green-600">{formatFileSize(estimatedSize)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-medium">Estimated Savings:</span>
                    <span className="font-bold text-green-600">
                      {Math.round((1 - (estimatedSize / totalSize)) * 100)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              onClick={handleCompress}
              disabled={isProcessing || files.length === 0}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 brutal-button"
            >
              {isProcessing ? 'Compressing...' : 'Compress Now'}
            </Button>
            
            {isProcessing && (
              <Button
                onClick={cancelCompression}
                variant="outline"
                className="font-bold brutal-border"
              >
                Cancel
              </Button>
            )}
          </div>

          {/* Progress and Logs */}
          {(isProcessing || logs.length > 0) && (
            <div className="bg-white p-6 rounded-xl brutal-border mb-8">
              <h3 className="font-bold text-lg mb-3">Compression Progress</h3>
              
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

          {/* File Size Warning */}
          {totalSize > 150 * 1024 * 1024 && (
            <Alert className="mb-8">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Large File Warning</AlertTitle>
              <AlertDescription>
                Files larger than 150MB may cause browser performance issues. Consider splitting into smaller batches or using a desktop application for very large files.
              </AlertDescription>
            </Alert>
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
            {compressFaqs.map((faq, index) => (
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
