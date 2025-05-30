import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const Summaries = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [summaryResult, setSummaryResult] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      console.log(`📄 Extracting text from PDF: ${file.name}`);
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      console.log(`📄 PDF has ${pdf.numPages} pages`);
      let fullText = "";
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => item.str).join(" ");
        fullText += pageText + "\n";
        
        // Update progress during extraction
        setUploadProgress(Math.round((i / pdf.numPages) * 25));
      }
      
      console.log(`📄 Extracted ${fullText.length} characters from PDF`);
      return fullText;
    } catch (error) {
      console.error("PDF extraction error:", error);
      throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const fetchSummaryFromAPI = async (text: string): Promise<string> => {
    console.log(`🔄 Sending ${text.length} characters to API`);
    
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: text.trim() }),
      });

      console.log(`📡 API Response: ${response.status} ${response.statusText}`);
      
      // Get raw response text first
      const responseText = await response.text();
      console.log(`📡 Raw response (first 200 chars):`, responseText.slice(0, 200));

      // Try to parse JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        throw new Error(`Invalid response format: ${responseText.slice(0, 200)}...`);
      }

      if (!response.ok) {
        console.error("❌ API Error Response:", data);
        throw new Error(data.error || `API request failed with status ${response.status}`);
      }

      if (!data.summary) {
        console.error("❌ No summary in response:", data);
        throw new Error("No summary received from API");
      }

      console.log(`✅ Summary received: ${data.summary.length} characters`);
      return data.summary;

    } catch (error) {
      console.error("API request error:", error);
      throw error;
    }
  };

  // Test API connectivity
  const testAPI = async () => {
    try {
      console.log("🧪 Testing API connectivity...");
      const response = await fetch("/api/test-env");
      const data = await response.json();
      setDebugInfo(data);
      console.log("🧪 API Test Result:", data);
      
      toast({
        title: "API Test Complete",
        description: `Method: ${data.method}, Environment: ${data.environment.NODE_ENV}`,
      });
    } catch (error) {
      console.error("API test failed:", error);
      toast({
        title: "API Test Failed",
        description: "Check console for details",
        variant: "destructive"
      });
    }
  };

  const handleUpload = async () => {
    // Validation
    if (!selectedFile) {
      return toast({ 
        title: "No file selected", 
        description: "Please select a PDF file first.", 
        variant: "destructive" 
      });
    }
    
    if (!currentUser) {
      return toast({ 
        title: "Authentication required", 
        description: "Please sign in to use this feature.", 
        variant: "destructive" 
      });
    }
    
    if (selectedFile.type !== "application/pdf") {
      return toast({ 
        title: "Invalid file type", 
        description: "Please upload a PDF file only.", 
        variant: "destructive" 
      });
    }

    // Reset state
    setIsUploading(true);
    setUploadProgress(0);
    setProcessingError(null);
    setSummaryResult(null);

    try {
      console.log(`🚀 Starting processing for: ${selectedFile.name}`);
      
      // Step 1: Extract text from PDF (0-25%)
      setUploadProgress(5);
      const rawText = await extractTextFromPDF(selectedFile);
      
      if (!rawText || rawText.trim().length === 0) {
        throw new Error("Could not extract any text from this PDF. The file might be image-based or corrupted.");
      }

      if (rawText.trim().length < 50) {
        throw new Error("The extracted text is too short to summarize effectively.");
      }

      console.log(`📝 Text extracted: ${rawText.length} characters`);
      setUploadProgress(30);

      // Step 2: Prepare text for API (limit to 15,000 characters)
      const trimmedText = rawText.length > 15000 ? rawText.slice(0, 15000) : rawText;
      console.log(`📝 Text prepared for API: ${trimmedText.length} characters`);
      setUploadProgress(40);

      // Step 3: Get summary from API (40-90%)
      const summary = await fetchSummaryFromAPI(trimmedText);
      setUploadProgress(90);

      // Step 4: Complete
      setSummaryResult(summary);
      setUploadProgress(100);
      
      toast({ 
        title: "Summary Generated!", 
        description: `Successfully summarized ${selectedFile.name}` 
      });

    } catch (err: any) {
      console.error("💥 Processing failed:", err);
      const errorMessage = err.message || "An unexpected error occurred during processing";
      setProcessingError(errorMessage);
      
      toast({ 
        title: "Processing Failed", 
        description: errorMessage, 
        variant: "destructive" 
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">PDF Summarizer</h1>
            <p className="text-gray-600 mb-6">Upload a PDF document to generate an AI-powered summary</p>
            
            {/* Debug Section */}
            <div className="mb-6 p-4 bg-gray-100 rounded-lg">
              <div className="flex gap-4 mb-4">
                <Button variant="outline" onClick={testAPI}>
                  Test API Connection
                </Button>
                {debugInfo && (
                  <div className="text-sm text-gray-600">
                    Last test: {debugInfo.method} - Env: {debugInfo.environment.NODE_ENV} - 
                    API Key: {debugInfo.hasOpenRouterKey ? '✅' : '❌'}
                  </div>
                )}
              </div>
            </div>

            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select PDF File
              </label>
              <input 
                type="file" 
                accept=".pdf"
                onChange={e => e.target.files && setSelectedFile(e.target.files[0])}
                className="block w-full text-sm text-gray-500 
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                disabled={isUploading}
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                </p>
              )}
            </div>

            {/* Upload Button */}
            <Button 
              className="w-full mb-4" 
              onClick={handleUpload} 
              disabled={!selectedFile || isUploading}
              size="lg"
            >
              {isUploading ? "Processing PDF..." : "Generate Summary"}
            </Button>

            {/* Progress Bar */}
            {uploadProgress > 0 && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Processing...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            {/* Error Display */}
            {processingError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-red-800 font-medium mb-1">Processing Error</h3>
                <p className="text-red-700 text-sm">{processingError}</p>
              </div>
            )}

            {/* Summary Display */}
            {summaryResult && (
              <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
                <h2 className="text-xl font-semibold text-green-800 mb-3">Summary</h2>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {summaryResult}
                  </p>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => navigator.clipboard.writeText(summaryResult)}
                  >
                    Copy Summary
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSummaryResult(null);
                      setSelectedFile(null);
                      setUploadProgress(0);
                    }}
                  >
                    Start New Summary
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Summaries;
