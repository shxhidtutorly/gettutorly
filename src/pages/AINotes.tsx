
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Brain, FileText, Upload } from "lucide-react";

const AINotes = () => {
  const [inputText, setInputText] = useState("");
  const [generatedNotes, setGeneratedNotes] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateNotes = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Please enter some text",
        description: "Add some content to generate notes from",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate AI note generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      setGeneratedNotes(`# AI Generated Notes

## Key Points:
- ${inputText.split('.')[0] || inputText.substring(0, 50)}...
- Main concepts extracted from your content
- Structured format for better understanding

## Summary:
${inputText.length > 100 ? inputText.substring(0, 100) + '...' : inputText}

## Study Tips:
- Review these notes regularly
- Create flashcards from key points
- Test your understanding with quizzes`);
      
      toast({
        title: "Notes generated successfully!",
        description: "Your AI notes are ready for review",
      });
    } catch (error) {
      toast({
        title: "Failed to generate notes",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />

      <main className="flex-1 py-8 px-2 md:px-4 pb-20 md:pb-8">
        <div className="container max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
              <Brain className="h-8 w-8 text-blue-500" />
              AI Notes Generator
            </h1>
            <p className="text-muted-foreground">
              Transform your study materials into structured, AI-generated notes
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <Card className="dark:bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Input Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste your study material, lecture notes, or any text content here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[300px]"
                />
                <Button 
                  onClick={generateNotes} 
                  disabled={isGenerating || !inputText.trim()}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Brain className="h-4 w-4 mr-2 animate-spin" />
                      Generating Notes...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Generate AI Notes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Output Section */}
            <Card className="dark:bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Generated Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generatedNotes ? (
                  <div className="prose prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-sm">{generatedNotes}</pre>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Your AI-generated notes will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default AINotes;
