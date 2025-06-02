
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { extractTextFromFile, ExtractionResult } from "@/lib/fileExtractor";

interface FileUploaderProps {
  onFileProcessed: (result: ExtractionResult) => void;
  isProcessing: boolean;
}

const FileUploader = ({ onFileProcessed, isProcessing }: FileUploaderProps) => {
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const supportedFormats = ['.pdf', '.docx', '.txt', '.md', '.html'];

  const handleFileUpload = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    
    if (!supportedFormats.includes(`.${ext}`)) {
      toast({
        variant: "destructive",
        title: "Unsupported file format",
        description: `Please upload one of: ${supportedFormats.join(', ')}`
      });
      return;
    }

    setProgress(10);

    try {
      setProgress(30);
      const result = await extractTextFromFile(file);
      setProgress(70);
      
      if (!result.text.trim()) {
        throw new Error('No text could be extracted from the file');
      }

      setProgress(100);
      onFileProcessed(result);
      
      setTimeout(() => setProgress(0), 1000);
      
      toast({
        title: "File processed successfully",
        description: `Extracted text from ${file.name}`
      });
    } catch (error) {
      console.error('File processing error:', error);
      setProgress(0);
      toast({
        variant: "destructive",
        title: "Error processing file",
        description: error instanceof Error ? error.message : "Please try again"
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div 
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          } ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          <Upload className={`w-12 h-12 mx-auto mb-4 ${dragActive ? 'text-primary' : 'text-muted-foreground'}`} />
          <h3 className="text-lg font-semibold mb-2">Upload Your Study Material</h3>
          <p className="text-muted-foreground mb-4">
            Drag and drop or click to select a file
          </p>
          
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".pdf,.docx,.txt,.md,.html"
            onChange={handleFileSelect}
            disabled={isProcessing}
          />
          
          <Button 
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={isProcessing}
            className="mb-4"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Select File
              </>
            )}
          </Button>
          
          <div className="flex flex-wrap justify-center gap-2">
            {supportedFormats.map(format => (
              <span key={format} className="bg-muted px-2 py-1 rounded text-xs">
                {format.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
        
        {progress > 0 && (
          <div className="mt-6">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-center text-muted-foreground mt-2">
              Processing file... {progress}%
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUploader;
