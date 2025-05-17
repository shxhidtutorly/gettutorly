
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileIcon, ImageIcon, FileTextIcon, LinkIcon, UploadIcon, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";

const DocumentUploader = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [text, setText] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();
  
  const simulateUploadProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
    
    return interval;
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };
  
  const handleDragLeave = () => {
    setDragActive(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };
  
  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    handleFileUpload(e.target.files[0]);
  };
  
  const handleFileUpload = (file: File) => {
    setIsUploading(true);
    const interval = simulateUploadProgress();
    
    // Simulate file upload and processing
    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        toast({
          title: "Document uploaded successfully!",
          description: "We're analyzing your document to create your personalized study materials.",
        });
      }, 500);
    }, 2000);
  };
  
  const handleTextSubmit = () => {
    if (!text) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter some text to analyze.",
      });
      return;
    }
    
    setIsUploading(true);
    const interval = simulateUploadProgress();
    
    // Simulate processing
    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        toast({
          title: "Text submitted successfully!",
          description: "We're analyzing your text to create your personalized study materials.",
        });
        setText("");
      }, 500);
    }, 1500);
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto hover-glow">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-center">Upload Your Study Material</CardTitle>
        <CardDescription className="text-center">Import your documents, images, or paste text to start learning</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="file" className="flex items-center gap-2">
              <FileIcon className="h-4 w-4" />
              <span className="hidden sm:inline">File</span>
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Image</span>
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <FileTextIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Text</span>
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              <span className="hidden sm:inline">URL</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="file">
            <div 
              className={`flex flex-col items-center justify-center border-2 border-dashed ${dragActive ? 'border-spark-primary bg-spark-light/50' : 'border-spark-light bg-spark-gray'} rounded-xl p-8 transition-all duration-200`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <FileIcon className={`w-10 h-10 ${dragActive ? 'text-spark-primary' : 'text-spark-secondary'} mb-4 ${dragActive ? 'animate-bounce-subtle' : ''}`} />
              <p className="text-center mb-4">Drag and drop your PDF or document file here, or click to browse</p>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleUploadFile}
              />
              <Button 
                onClick={() => document.getElementById('file-upload')?.click()}
                className="spark-button-primary flex items-center gap-2 button-click-effect"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadIcon className="h-4 w-4" />
                    Upload Document
                  </>
                )}
              </Button>
              
              {isUploading && (
                <div className="w-full mt-6 space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-sm text-center text-muted-foreground">
                    {uploadProgress < 100 ? 'Uploading...' : 'Processing document...'}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="image">
            <div 
              className={`flex flex-col items-center justify-center border-2 border-dashed ${dragActive ? 'border-spark-primary bg-spark-light/50' : 'border-spark-light bg-spark-gray'} rounded-xl p-8 transition-all duration-200`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <ImageIcon className={`w-10 h-10 ${dragActive ? 'text-spark-primary' : 'text-spark-secondary'} mb-4 ${dragActive ? 'animate-bounce-subtle' : ''}`} />
              <p className="text-center mb-4">Drag and drop your image here, or click to browse</p>
              <input
                type="file"
                id="image-upload"
                className="hidden"
                accept="image/*"
                onChange={handleUploadFile}
              />
              <Button 
                onClick={() => document.getElementById('image-upload')?.click()}
                className="spark-button-primary flex items-center gap-2 button-click-effect"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadIcon className="h-4 w-4" />
                    Upload Image
                  </>
                )}
              </Button>
              
              {isUploading && (
                <div className="w-full mt-6 space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-sm text-center text-muted-foreground">
                    {uploadProgress < 100 ? 'Uploading...' : 'Processing image...'}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="text">
            <div className="flex flex-col">
              <textarea
                className="w-full h-40 border border-spark-light rounded-xl p-4 mb-4 focus:outline-none focus:ring-2 focus:ring-spark-primary transition-all"
                placeholder="Paste your text here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <Button 
                className="spark-button-primary self-end button-click-effect"
                onClick={handleTextSubmit}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : 'Analyze Text'}
              </Button>
              
              {isUploading && (
                <div className="w-full mt-6 space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-sm text-center text-muted-foreground">
                    {uploadProgress < 100 ? 'Processing...' : 'Analyzing text...'}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="url">
            <div className="flex flex-col">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="url"
                  className="flex-1 spark-input"
                  placeholder="Enter an article or webpage URL..."
                />
                <Button className="spark-button-primary button-click-effect">
                  Import
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-center text-sm text-muted-foreground">
        <div className="flex flex-wrap justify-center gap-2 w-full">
          <span className="bg-spark-light px-2 py-1 rounded-md text-xs">PDF</span>
          <span className="bg-spark-light px-2 py-1 rounded-md text-xs">Word</span>
          <span className="bg-spark-light px-2 py-1 rounded-md text-xs">Text</span>
          <span className="bg-spark-light px-2 py-1 rounded-md text-xs">PNG</span>
          <span className="bg-spark-light px-2 py-1 rounded-md text-xs">JPG</span>
          <span className="bg-spark-light px-2 py-1 rounded-md text-xs">URL</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DocumentUploader;
