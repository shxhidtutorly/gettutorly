import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Download, Loader2 } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function Summaries() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [summary, setSummary] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const testAPIConnection = async () => {
    console.log("🧪 Testing API connectivity...");
    try {
      // Test the debug endpoint first
      const response = await fetch("/api/test-env", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("🔍 Test API Response Status:", response.status);
      console.log("🔍 Test API Response Headers:", response.headers);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ API test successful:", data);
      setDebugInfo(data);
      return data;
    } catch (error) {
      console.error("API test failed:", error);
      setError(`API connectivity test failed: ${error.message}`);
      return null;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    if (uploadedFile.type !== "application/pdf") {
      setError("Please upload a PDF file only.");
      return;
    }

    setFile(uploadedFile);
    setError("");
    setProgress(10);

    try {
      console.log("📄 Processing PDF...");
      const arrayBuffer = await uploadedFile.arrayBuffer();
      setProgress(30);

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      let fullText = "";

      console.log(`📖 PDF has ${numPages} pages`);

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        fullText += pageText + "\n";
        setProgress(30 + (i / numPages) * 40);
      }

      console.log(`📝 Extracted ${fullText.length} characters`);
      setExtractedText(fullText);
      setProgress(70);
    } catch (error) {
      console.error("❌ PDF processing error:", error);
      setError(`Failed to process PDF: ${error.message}`);
      setProgress(0);
    }
  };

  const generateSummary = async () => {
    if (!extractedText.trim()) {
      setError("No text available to summarize");
      return;
    }

    setIsProcessing(true);
    setError("");
    setProgress(70);

    try {
      // Test API connection first
      await testAPIConnection();

      console.log("🔄 Sending request to summarize API...");
      console.log(`📊 Text length: ${extractedText.length} characters`);

      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: extractedText
        }),
      });

      console.log("📡 API Response Status:", response.status);
      console.log("📡 API Response OK:", response.ok);

      // Log the raw response for debugging
      const responseText = await response.text();
      console.log("📡 Raw response (first 200 chars):", responseText.substring(0, 200));

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Try to parse the response as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        throw new Error(`Invalid response format: ${responseText.substring(0, 100)}...`);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.summary) {
        throw new Error("No summary received from API");
      }

      console.log("✅ Summary generated successfully");
      setSummary(data.summary);
      setProgress(100);
    } catch (error) {
      console.error("API request error:", error);
      setError(`Failed to generate summary: ${error.message}`);
      setProgress(70);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadSummary = () => {
    if (!summary) return;

    const blob = new Blob([summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file?.name.replace('.pdf', '')}_summary.txt` || "summary.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetAll = () => {
    setFile(null);
    setExtractedText("");
    setSummary("");
    setProgress(0);
    setError("");
    setDebugInfo(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              PDF Document Summarizer
            </h1>
            <p className="text-lg text-gray-600">
              Upload a PDF document and get an AI-powered summary
            </p>
          </div>

          {/* Debug Info */}
          {debugInfo && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">🔍 Debug Information</h3>
              <pre className="text-xs text-blue-700 overflow-x-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}

          {/* Test API Button */}
          <div className="mb-6 text-center">
            <Button 
              onClick={testAPIConnection}
              variant="outline"
              className="mr-4"
            >
              🧪 Test API Connection
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">❌ {error}</p>
            </div>
          )}

          {/* Progress Bar */}
          {progress > 0 && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Processing...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* File Upload */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="mb-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-lg font-medium text-gray-700">
                    Choose a PDF file to upload
                  </span>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              {file && (
                <div className="text-sm text-gray-600">
                  <FileText className="inline h-4 w-4 mr-1" />
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </div>
          </div>

          {/* Text Preview */}
          {extractedText && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Extracted Text Preview</h3>
              <div className="bg-gray-50 p-4 rounded border max-h-40 overflow-y-auto">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {extractedText.substring(0, 500)}
                  {extractedText.length > 500 && "..."}
                </p>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Total characters: {extractedText.length}
              </div>
            </div>
          )}

          {/* Generate Summary Button */}
          {extractedText && !summary && (
            <div className="text-center mb-6">
              <Button
                onClick={generateSummary}
                disabled={isProcessing}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Summary...
                  </>
                ) : (
                  "Generate Summary"
                )}
              </Button>
            </div>
          )}

          {/* Summary Display */}
          {summary && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Generated Summary</h3>
                <Button
                  onClick={downloadSummary}
                  variant="outline"
                  size="sm"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
              <div className="bg-gray-50 p-4 rounded border">
                <p className="text-gray-700 whitespace-pre-wrap">{summary}</p>
              </div>
            </div>
          )}

          {/* Reset Button */}
          {(file || summary) && (
            <div className="text-center">
              <Button
                onClick={resetAll}
                variant="outline"
                className="text-gray-600 hover:text-gray-800"
              >
                Start Over
              </Button>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
      <Footer />
    </div>
  );
}
