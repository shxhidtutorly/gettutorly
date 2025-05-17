import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollText, FileText, Plus, Clock, Upload, X, FileIcon, Loader2, Download, Share2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { fetchJinaSummary, checkPDFProcessable, storeSummary } from "@/lib/jinaReader";
import { useTheme } from "@/contexts/ThemeContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useSupabaseStorage } from "@/hooks/useSupabaseStorage";
import { getSummaries } from "@/lib/supabase";

interface Summary {
  id: number | string;
  title: string;
  description: string;
  type: "quick" | "deep";
  created: string;
  readTime: string;
  content?: string;
  fileName?: string;
  fileUrl?: string;
}

// Sample PDF for testing (you can replace this with a known working PDF URL)
const SAMPLE_PDF_URL = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

const Summaries = () => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [summaryResult, setSummaryResult] = useState<string | null>(null);
  const [viewingSummary, setViewingSummary] = useState<Summary | null>(null);
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const { toast } = useToast();
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const { uploadFile, progress: storageProgress } = useSupabaseStorage();
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  
  // Fetch user summaries from Supabase on component mount
  useEffect(() => {
    const fetchUserSummaries = async () => {
      if (currentUser) {
        try {
          const userSummaries = await getSummaries(currentUser.id);
          if (userSummaries && userSummaries.length > 0) {
            // Transform Supabase summaries to match the app's format
            const formattedSummaries = userSummaries.map((summary: any) => ({
              id: summary.id,
              title: summary.title || "Untitled Summary",
              description: summary.content.substring(0, 100) + "...",
              // Ensure type is either "quick" or "deep"
              type: summary.content.length > 500 ? "deep" as const : "quick" as const,
              created: new Date(summary.created_at).toLocaleDateString(),
              readTime: `${Math.max(1, Math.floor(summary.content.length / 1000))} min read`,
              content: summary.content,
              fileName: summary.file_name,
              fileUrl: summary.file_url
            }));
            setSummaries(formattedSummaries);
          }
        } catch (error) {
          console.error("Error fetching summaries:", error);
        }
      }
    };
    
    fetchUserSummaries();
  }, [currentUser]);
  
  const summaryTypes = {
    quick: { label: "Quick Recap", bg: "bg-spark-blue dark:bg-blue-800", icon: ScrollText },
    deep: { label: "Deep Dive", bg: "bg-spark-peach dark:bg-orange-800", icon: FileText }
  };
  
  const handleGenerateSummary = () => {
    setShowUploadDialog(true);
    setSummaryResult(null);
    setSelectedFile(null);
    setProcessingError(null);
    setFileUrl(null);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setProcessingError(null); // Clear any previous errors
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };
  
  const handleDragLeave = () => {
    setDragActive(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setProcessingError(null); // Clear any previous errors
    }
  };
  
  const handleUpload = async (e?: React.FormEvent) => {
    // Prevent default form submission if event is provided
    if (e) e.preventDefault();
    
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }
    
    // Check if user is authenticated
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload documents",
        variant: "destructive"
      });
      return;
    }
    
    // Check if file is a PDF
    if (selectedFile.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    setProcessingError(null);
    
    // Show initial upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 25) {
          clearInterval(interval);
          return 25; // Only go to 25% for file checking
        }
        return prev + 5;
      });
    }, 150);
    
    try {
      // First check if the PDF is processable
      console.log("Checking if PDF is processable:", selectedFile.name);
      const checkResult = await checkPDFProcessable(selectedFile);
      
      if (!checkResult.processable) {
        clearInterval(interval);
        setUploadProgress(0);
        setIsUploading(false);
        setProcessingError(`The PDF cannot be processed: ${checkResult.reason || 'Unknown issue'}`);
        
        toast({
          title: "PDF check failed",
          description: checkResult.reason || "This PDF format is not supported",
          variant: "destructive"
        });
        return;
      }
      
      // Upload file to Supabase Storage
      setUploadProgress(30);
      let fileDetails = null;
      
      if (currentUser) {
        fileDetails = await uploadFile(selectedFile, "summaries");
        if (!fileDetails) {
          throw new Error("File upload to storage failed");
        }
        setFileUrl(fileDetails.fileUrl);
      }
      
      // Update progress
      setUploadProgress(70);
      
      // Process PDF and generate summary
      console.log("Starting summary generation for:", selectedFile.name);
      const summaryResponse = await fetchJinaSummary(selectedFile);
      
      // Extract the summary text from the response
      let summaryText = "";
      if (typeof summaryResponse === 'string') {
        summaryText = summaryResponse;
      } else {
        summaryText = summaryResponse.summary;
      }
      
      // Check if the response is an error message
      if (typeof summaryText === 'string' && summaryText.startsWith('Error:')) {
        throw new Error(summaryText);
      }
      
      console.log("Summary result:", typeof summaryText === 'string' ? summaryText.substring(0, 100) + "..." : "Summary object received");
      
      // Complete the progress
      clearInterval(interval);
      setUploadProgress(100);
      
      // Set the summary result and keep dialog open
      setSummaryResult(summaryText);
      
      // If we have a file URL and user is authenticated, store the summary in Supabase
      if (fileUrl && currentUser && typeof summaryText === 'string') {
        await storeSummary(
          currentUser.id, 
          summaryText,
          selectedFile.name,
          fileUrl
        );
      }
      
      // Show success toast
      toast({
        title: "Summary generated",
        description: "Your document has been processed successfully"
      });
    } catch (error) {
      console.error("Error generating summary:", error);
      clearInterval(interval);
      setUploadProgress(0);
      
      // Set a more descriptive error message
      const errorMessage = error instanceof Error ? error.message : "Could not process your PDF. Please try again with a different document.";
      setProcessingError(errorMessage);
      
      toast({
        title: "Error processing document",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleLoadSamplePDF = async () => {
    try {
      setIsLoadingSample(true);
      
      // Fetch the sample PDF
      const response = await fetch(SAMPLE_PDF_URL);
      if (!response.ok) throw new Error("Failed to fetch sample PDF");
      
      const pdfBlob = await response.blob();
      const file = new File([pdfBlob], "sample-document.pdf", { type: "application/pdf" });
      
      setSelectedFile(file);
      setProcessingError(null);
      
      toast({
        title: "Sample PDF loaded",
        description: "You can now generate a summary from this sample document"
      });
    } catch (error) {
      console.error("Error loading sample PDF:", error);
      toast({
        title: "Error loading sample",
        description: "Could not load the sample PDF. Please try uploading your own file.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingSample(false);
    }
  };
  
  const handleSaveSummary = async () => {
    if (!summaryResult || !selectedFile || !currentUser) return;
    
    try {
      if (fileUrl) {
        // Save summary to Supabase
        const savedSummary = await storeSummary(
          currentUser.id,
          summaryResult,
          selectedFile.name,
          fileUrl
        );
        
        // Create a new summary object with correct typing
        const summaryType = summaryResult.length > 500 ? "deep" as const : "quick" as const;
        const newSummary: Summary = {
          id: savedSummary.id || Date.now(),
          title: selectedFile.name.replace(/\.[^/.]+$/, ""), // Remove file extension
          description: summaryResult.substring(0, 100) + "...",
          type: summaryType,
          created: "Just now",
          readTime: `${Math.max(1, Math.floor(summaryResult.length / 1000))} min read`,
          content: summaryResult,
          fileName: selectedFile.name,
          fileUrl: fileUrl
        };
        
        // Add the new summary to the list
        setSummaries([newSummary, ...summaries]);
        
        // Close the dialog
        setShowUploadDialog(false);
        setSummaryResult(null);
        setSelectedFile(null);
        setProcessingError(null);
        setFileUrl(null);
        
        // Show success notification
        toast({
          title: "Summary saved",
          description: "Your summary has been saved to your library"
        });
      }
    } catch (error) {
      console.error("Error saving summary:", error);
      toast({
        title: "Error saving summary",
        description: "Could not save your summary. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleViewSummary = (summary: Summary) => {
    setViewingSummary(summary);
    setShowSummaryDialog(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 pb-20 md:pb-8 text-gray-800 dark:text-white">
        <div className="container max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800 dark:text-white">Smart Summaries</h1>
              <p className="text-gray-700 dark:text-gray-200">Get condensed versions of your study materials in different formats</p>
            </div>
            <Button 
              className="bg-primary text-white button-click-effect"
              onClick={handleGenerateSummary}
            >
              <Plus className="mr-2 h-4 w-4" /> Generate New Summary
            </Button>
          </div>
          
          {/* Grid of summaries */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {summaries.map(summary => {
              const type = summaryTypes[summary.type];
              const Icon = type.icon;
              
              return (
                <Card 
                  key={summary.id} 
                  className="hover-glow hover-lift transition-all duration-300 h-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-pointer"
                  onClick={() => handleViewSummary(summary)}
                >
                  <CardHeader className={cn("rounded-t-lg", type.bg)}>
                    <div className="flex justify-between items-center">
                      <div className="bg-white/20 p-2 rounded-full">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-xs font-medium px-2 py-1 bg-white/30 rounded-full text-white">
                        {type.label}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <CardTitle className="text-lg mb-2 text-gray-800 dark:text-white">{summary.title}</CardTitle>
                    <CardDescription className="line-clamp-2 mb-4 text-gray-700 dark:text-gray-200">{summary.description}</CardDescription>
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                      <span>{summary.created}</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{summary.readTime}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {summaries.length === 0 && (
            <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <ScrollText className="h-12 w-12 mx-auto text-gray-500 dark:text-gray-400 mb-4" />
              <h3 className="text-xl font-medium mb-2 text-gray-800 dark:text-white">No summaries yet</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Upload study material to generate smart summaries.
              </p>
              <Button className="bg-primary text-white button-click-effect" onClick={handleGenerateSummary}>
                <Plus className="mr-2 h-4 w-4" /> Create Your First Summary
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
      <BottomNav />
      
      {/* File Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={(open) => {
        if (!isUploading) setShowUploadDialog(open);
      }}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-800 dark:text-white">Upload Document for Summary</DialogTitle>
            <DialogDescription className="text-gray-700 dark:text-gray-200">
              Upload your study material to generate a smart summary
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {!summaryResult && (
              <form onSubmit={handleUpload} className="space-y-4">
                <div className={`relative border-2 border-dashed rounded-lg p-6 text-center ${selectedFile ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-gray-300 dark:border-gray-600'} ${dragActive ? 'border-primary bg-primary/5 dark:bg-primary/10' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {selectedFile ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileIcon className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                        <div className="space-y-1 text-left">
                          <p className="text-sm font-medium text-gray-800 dark:text-white">{selectedFile.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-300">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedFile(null)}
                        className="text-gray-800 dark:text-white"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="rounded-full bg-gray-100 dark:bg-gray-700 p-2">
                        <Upload className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-800 dark:text-white">Drag & drop or click to upload</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          PDF files (max 20MB)
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    accept=".pdf"
                    disabled={isUploading}
                  />
                </div>
                
                {/* Processing error alert */}
                {processingError && (
                  <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <AlertTitle>Processing Error</AlertTitle>
                    <AlertDescription>
                      {processingError}
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Sample PDF button */}
                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleLoadSamplePDF}
                    disabled={isLoadingSample || isUploading}
                    className="text-gray-800 dark:text-white"
                  >
                    {isLoadingSample ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading sample...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Load Sample PDF
                      </>
                    )}
                  </Button>
                </div>
                
                {isUploading && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-center text-gray-600 dark:text-gray-300">
                      {uploadProgress < 30 ? 'Checking document...' : 
                       uploadProgress < 70 ? 'Uploading document...' :
                       uploadProgress < 100 ? 'Generating summary...' : 'Summary ready!'}
                    </p>
                  </div>
                )}
              </form>
            )}
            
            {summaryResult && (
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mt-4 max-h-[400px] overflow-y-auto">
                <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Generated Summary</h3>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-200 whitespace-pre-line">
                    {summaryResult}
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowUploadDialog(false);
                  setSummaryResult(null);
                  setSelectedFile(null);
                  setIsUploading(false);
                  setProcessingError(null);
                  setFileUrl(null);
                }} 
                disabled={isUploading}
                className="text-gray-800 dark:text-white bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                type="button"
              >
                {summaryResult ? "Close" : "Cancel"}
              </Button>
              
              {!summaryResult && (
                <Button 
                  className="bg-primary text-white"
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  type="button"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : 'Generate Summary'}
                </Button>
              )}
              
              {summaryResult && (
                <Button 
                  className="bg-primary text-white"
                  onClick={handleSaveSummary}
                  type="button"
                >
                  Save Summary
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Summary Dialog */}
      <Dialog 
        open={showSummaryDialog} 
        onOpenChange={setShowSummaryDialog}
      >
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl text-gray-800 dark:text-white flex items-center gap-2">
              {viewingSummary?.fileName && <FileText className="h-5 w-5" />}
              {viewingSummary?.title}
            </DialogTitle>
            <DialogDescription className="text-gray-700 dark:text-gray-300">
              {viewingSummary?.type === 'quick' ? 'Quick Recap' : 'Deep Dive'} • {viewingSummary?.readTime}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto py-4 px-1">
            <div className="prose dark:prose-invert max-w-none">
              {viewingSummary?.content && (
                <div className="whitespace-pre-line text-gray-800 dark:text-gray-100">
                  {viewingSummary.content}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Created {viewingSummary?.created}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="text-gray-800 dark:text-gray-200">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" className="text-gray-800 dark:text-gray-200">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button 
                onClick={() => setShowSummaryDialog(false)}
                className="bg-primary text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Summaries;
