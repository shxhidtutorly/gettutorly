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
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const Summaries = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [summaryResult, setSummaryResult] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Debug: Check environment variables
  console.log("=== ENVIRONMENT DEBUG ===");
  console.log("NEXT_PUBLIC_OPENROUTER_API_KEY exists:", !!process.env.NEXT_PUBLIC_OPENROUTER_API_KEY);
  console.log("NEXT_PUBLIC_OPENROUTER_API_KEY length:", process.env.NEXT_PUBLIC_OPENROUTER_API_KEY?.length || 0);
  console.log("NEXT_PUBLIC_OPENROUTER_API_KEY starts with sk-:", process.env.NEXT_PUBLIC_OPENROUTER_API_KEY?.startsWith('sk-'));
  console.log("All NEXT_PUBLIC env vars:", Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')));

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n";
    }
    return fullText;
  };

  const fetchOpenRouterSummary = async (text: string): Promise<string> => {
    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    console.log("=== API CALL DEBUG ===");
    console.log("API Key from env:", apiKey ? `${apiKey.substring(0, 10)}...` : "MISSING");
    console.log("API Key length:", apiKey?.length || 0);

    if (!apiKey) {
      // More detailed error information
      const availableEnvVars = Object.keys(process.env).filter(key => key.includes('OPENROUTER') || key.includes('API'));
      throw new Error(`❌ OpenRouter API key is missing. Available env vars with 'OPENROUTER' or 'API': ${availableEnvVars.join(', ')}`);
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://gettutorly.com",
        "X-Title": "Tutorly",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that summarizes documents."
          },
          {
            role: "user",
            content: `Summarize this document:\n\n${text}`
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ API error:", data);
      throw new Error(data.error?.message || "Failed to fetch summary");
    }

    return data.choices?.[0]?.message?.content || "No summary generated.";
  };

  const handleUpload = async () => {
    if (!selectedFile)
      return toast({ title: "No file selected", description: "Select a file.", variant: "destructive" });
    if (!currentUser)
      return toast({ title: "Login required", description: "Please sign in first.", variant: "destructive" });
    if (selectedFile.type !== "application/pdf")
      return toast({ title: "Invalid file", description: "Upload a PDF.", variant: "destructive" });

    setIsUploading(true);
    setUploadProgress(25);
    setProcessingError(null);

    try {
      const rawText = await extractTextFromPDF(selectedFile);
      if (!rawText || rawText.trim().length === 0) {
        throw new Error("Could not extract text from this PDF.");
      }

      setUploadProgress(50);
      const trimmedText = rawText.length > 15000 ? rawText.slice(0, 15000) : rawText;
      const summary = await fetchOpenRouterSummary(trimmedText);

      setUploadProgress(100);
      setSummaryResult(summary);
      toast({ title: "Summary Ready", description: "Summary generated successfully." });
    } catch (err: any) {
      console.error("Full error:", err);
      setProcessingError(err.message);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4">
      <Navbar />
      <main className="min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Summarize PDF</h1>
        
        {/* Debug info display */}
        <div className="mb-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
          <p><strong>Debug Info:</strong></p>
          <p>API Key Available: {process.env.NEXT_PUBLIC_OPENROUTER_API_KEY ? '✅ Yes' : '❌ No'}</p>
          <p>API Key Length: {process.env.NEXT_PUBLIC_OPENROUTER_API_KEY?.length || 0}</p>
          <p>Environment: {process.env.NODE_ENV}</p>
        </div>

        <input type="file" accept=".pdf" onChange={e => e.target.files && setSelectedFile(e.target.files[0])} />
        <Button className="mt-4" onClick={handleUpload} disabled={!selectedFile || isUploading}>
          {isUploading ? "Processing..." : "Generate Summary"}
        </Button>
        {uploadProgress > 0 && <Progress className="mt-2" value={uploadProgress} />}
        {summaryResult && (
          <div className="mt-4 p-4 border rounded bg-white dark:bg-gray-800">
            <h2 className="font-semibold mb-2">Summary:</h2>
            <p className="whitespace-pre-line">{summaryResult}</p>
          </div>
        )}
        {processingError && (
          <div className="mt-2 text-red-500">
            <p>{processingError}</p>
          </div>
        )}
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Summaries;
