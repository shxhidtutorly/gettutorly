
import { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import AIChat from "@/components/features/AIChat";
import DocumentUploader from "@/components/features/DocumentUploader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, MessageCircle } from "lucide-react";

const AIAssistant = () => {
  // Update document title on component mount
  useEffect(() => {
    document.title = "AI Assistant | Tutorly";
    // Restore original title when component unmounts
    return () => {
      document.title = "Tutorly - Smart Learning Platform";
    };
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      
      <main className="container py-8 text-gray-800 dark:text-white">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">AI Learning Assistant</h1>
        
        <Tabs defaultValue="chat" className="max-w-5xl mx-auto">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <span className="font-medium">Ask Questions</span>
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <span className="font-medium">Upload Study Material</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="focus:outline-none">
            <div className="max-w-5xl mx-auto">
              <AIChat />
            </div>
          </TabsContent>
          
          <TabsContent value="upload" className="focus:outline-none">
            <div className="max-w-5xl mx-auto">
              <DocumentUploader />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AIAssistant;
