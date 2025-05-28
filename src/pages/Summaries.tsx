import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
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

  const fetchJinaSummary = async (file: File): Promise<string> => {
    const text = await extractTextFromPDF(file);
    const response = await fetch("https://r.jina.ai/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: text })
    });
    if (!response.ok) throw new Error("Jina summary API failed");
    return await response.text();
  };

  const handleUpload = async () => {
    if (!selectedFile) return toast({ title: "No file selected", description: "Select a file.", variant: "destructive" });
    if (!currentUser) return toast({ title: "Login required", description: "Please sign in first.", variant: "destructive" });
    if (selectedFile.type !== "application/pdf") return toast({ title: "Invalid file", description: "Upload a PDF.", variant: "destructive" });

    setIsUploading(true);
    setUploadProgress(25);

    try {
      setUploadProgress(50);
      const summary = await fetchJinaSummary(selectedFile);
      setUploadProgress(100);
      setSummaryResult(summary);
      toast({ title: "Summary Ready", description: "Summary generated successfully." });
    } catch (err: any) {
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
