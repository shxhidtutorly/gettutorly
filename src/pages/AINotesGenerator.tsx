import { useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, Brain, Sparkles, Download, HelpCircle, Lightbulb, BookOpen, FileImage, File, Loader2 } from "lucide-react";
import DocumentUploader from "@/components/features/DocumentUploader";
import NotesDisplay from "@/components/features/NotesDisplay";
import DownloadNotesButton from "@/components/features/DownloadNotesButton";
import QuizFromNotesButton from "@/components/features/QuizFromNotesButton";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { motion } from "framer-motion";

const AINotesGenerator = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [noteTitle, setNoteTitle] = useState("");
  const [manualTextInput, setManualTextInput] = useState("");
  const [generatedNotes, setGeneratedNotes] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleUpload = async (file: File) => {
    setUploadProgress(0);
    setIsLoading(true);

    // Simulate upload and processing
    const interval = setInterval(() => {
      setUploadProgress((prevProgress) => {
        const newProgress = prevProgress + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          // Simulate AI notes generation after upload
          setTimeout(() => {
            setGeneratedNotes(`
              # AI Generated Notes from ${file.name}
              
              ## Key Concepts
              - Concept 1: Explanation of the concept.
              - Concept 2: Explanation of the concept.
              
              ## Important Details
              - Detail 1: Description of the detail.
              - Detail 2: Description of the detail.
              
              ## Summary
              This document provides a comprehensive overview of the key concepts and important details related to the topic.
            `);
            setIsLoading(false);
            toast({
              title: "Notes Generated!",
              description: "AI has generated notes from your document.",
            });
          }, 1500);
          return 100;
        }
        return newProgress;
      });
    }, 200);
  };

  const handleTextSubmit = async () => {
    if (!manualTextInput.trim()) {
      toast({
        title: "Please enter some text",
        description: "Add some content to generate notes"
      });
      return;
    }

    setIsLoading(true);
    // Simulate AI notes generation
    setTimeout(() => {
      setGeneratedNotes(`
        # AI Generated Notes from Text Input
        
        ## Key Concepts
        - Concept A: Explanation of the concept.
        - Concept B: Explanation of the concept.
        
        ## Important Details
        - Detail X: Description of the detail.
        - Detail Y: Description of the detail.
        
        ## Summary
        This text input provides a summary of the key concepts and important details related to the topic.
      `);
      setIsLoading(false);
      toast({
        title: "Notes Generated!",
        description: "AI has generated notes from your text input.",
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-bl from-[#101010] via-[#23272e] to-[#09090b] text-white">
      <Navbar />

      <main className="flex-1 py-4 md:py-8 px-2 md:px-4 pb-20 md:pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container max-w-6xl mx-auto"
        >
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-4xl font-bold flex items-center gap-3">
              <Brain className="h-8 w-8 md:h-10 md:w-10 text-purple-400" />
              AI Notes Generator
            </h1>
            <p className="text-muted-foreground text-sm md:text-base mt-2">
              Upload documents or paste text to generate smart, AI-powered notes
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
            {/* Upload Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="dark:bg-card border-gray-700">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Upload className="h-5 w-5 text-blue-400" />
                    Upload Document
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  <DocumentUploader
                    onUpload={handleUpload}
                    uploadProgress={uploadProgress}
                  />
                  
                  <div className="mt-6">
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Generating Notes...</p>
                        <Progress value={uploadProgress} />
                      </div>
                    )}
                  </div>
                  
                  {isLoading && uploadProgress === 0 && (
                    <Alert className="mt-4">
                      <Loader2 className="mr-2 h-4 w-4" />
                      <AlertDescription>
                        Processing... Please wait.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Notes Display Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="dark:bg-card border-gray-700 h-full">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-400" />
                    Generated Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 h-full flex flex-col">
                  {generatedNotes ? (
                    <div className="space-y-4 flex-1">
                      <div className="flex flex-wrap gap-2 justify-between items-center">
                        <Badge variant="secondary" className="bg-green-600/20 text-green-400 border-green-600/30">
                          <Sparkles className="h-3 w-3 mr-1" />
                          AI Generated
                        </Badge>
                      
                        <div className="flex gap-2">
                          <DownloadNotesButton 
                            content={generatedNotes} 
                            filename={`${noteTitle || 'AI_Notes'}.md`}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </DownloadNotesButton>
                          <QuizFromNotesButton 
                            notesContent={generatedNotes} 
                            notesTitle={noteTitle}
                          >
                            <HelpCircle className="h-4 w-4 mr-1" />
                            Generate Quiz
                          </QuizFromNotesButton>
                        </div>
                      </div>
                    
                      <div className="flex-1 overflow-hidden">
                        <NotesDisplay content={generatedNotes} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-4 items-center justify-center h-full">
                      <FileText className="h-10 w-10 text-gray-500" />
                      <p className="text-sm text-gray-500 text-center">
                        No notes generated yet. Upload a document or paste text to get started.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Manual Text Input Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-6"
          >
            <Card className="dark:bg-card border-gray-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-yellow-400" />
                  Manual Text Input
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="space-y-4">
                  <Textarea
                    placeholder="Paste your text here..."
                    ref={textareaRef}
                    value={manualTextInput}
                    onChange={(e) => setManualTextInput(e.target.value)}
                    className="dark:bg-gray-800 border-gray-600 focus-visible:ring-blue-500 text-white"
                  />
                  <Button onClick={handleTextSubmit} disabled={isLoading} className="w-full">
                    Generate Notes from Text
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tips and Suggestions Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-6"
          >
            <Card className="dark:bg-card border-gray-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-orange-400" />
                  Tips for Better Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Start with clear and concise text.</li>
                  <li>Focus on key concepts and ideas.</li>
                  <li>Use headings and subheadings to organize notes.</li>
                  <li>Review and edit the generated notes for accuracy.</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
      <BottomNav />

      {/* Fixed CSS without invalid JSX props */}
      <style>{`
        .markdown-content h1 { font-size: 1.875rem; font-weight: bold; margin: 1.5rem 0 1rem 0; color: #f8fafc; }
        .markdown-content h2 { font-size: 1.5rem; font-weight: bold; margin: 1.25rem 0 0.75rem 0; color: #e2e8f0; }
        .markdown-content h3 { font-size: 1.25rem; font-weight: 600; margin: 1rem 0 0.5rem 0; color: #cbd5e1; }
        .markdown-content p { margin: 0.75rem 0; line-height: 1.7; color: #94a3b8; }
        .markdown-content ul, .markdown-content ol { margin: 1rem 0; padding-left: 1.5rem; color: #94a3b8; }
        .markdown-content li { margin: 0.5rem 0; line-height: 1.6; }
        .markdown-content strong { font-weight: 600; color: #f1f5f9; }
        .markdown-content em { font-style: italic; color: #e2e8f0; }
        .markdown-content code { background: #374151; padding: 0.125rem 0.25rem; border-radius: 0.25rem; font-family: 'Courier New', monospace; color: #fbbf24; }
        .markdown-content pre { background: #1f2937; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin: 1rem 0; }
        .markdown-content blockquote { border-left: 4px solid #6366f1; padding-left: 1rem; margin: 1rem 0; font-style: italic; color: #a78bfa; }
      `}</style>
    </div>
  );
};

export default AINotesGenerator;
