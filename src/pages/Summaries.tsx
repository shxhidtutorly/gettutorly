
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import DocumentUploader from "@/components/features/DocumentUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  FileText,
  Sparkles,
  Upload,
  Download,
  Copy,
  CheckCircle,
  Eye,
  Brain,
  Clock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useStudyTracking } from "@/hooks/useStudyTracking";

const Summaries = () => {
  const { currentUser } = useAuth();
  const { trackSummaryGeneration } = useStudyTracking();
  const { toast } = useToast();
  
  const [summaries, setSummaries] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [aiDemoText, setAiDemoText] = useState("");
  const [aiDemoResult, setAiDemoResult] = useState("");

  // Load user's summaries on component mount
  useEffect(() => {
    if (currentUser) {
      loadUserSummaries();
    }
  }, [currentUser]);

  const loadUserSummaries = async () => {
    // This would typically load from your database
    // For now, we'll use localStorage as a placeholder
    const stored = localStorage.getItem(`summaries_${currentUser?.id}`);
    if (stored) {
      setSummaries(JSON.parse(stored));
    }
  };

  const generateAISummary = async () => {
    if (!aiDemoText.trim()) {
      toast({
        title: "Please enter some text",
        description: "Add some content to summarize"
      });
      return;
    }
    
    setIsGenerating(true);
    setAiDemoResult("Generating summary...");
    
    try {
      // Simulate AI response
      setTimeout(() => {
        const summary = `📝 **AI Summary**: This text discusses ${aiDemoText.split(' ').slice(0, 3).join(' ')}... Key points include the main concepts and important details that enhance understanding and retention.`;
        setAiDemoResult(summary);
        
        // Track the activity
        trackSummaryGeneration();
        
        // Save summary
        const newSummary = {
          id: Date.now().toString(),
          title: `Summary ${summaries.length + 1}`,
          content: summary,
          originalText: aiDemoText,
          createdAt: new Date().toISOString(),
          wordCount: aiDemoText.split(' ').length
        };
        
        const updatedSummaries = [newSummary, ...summaries];
        setSummaries(updatedSummaries);
        localStorage.setItem(`summaries_${currentUser?.id}`, JSON.stringify(updatedSummaries));
        
        toast({
          title: "Summary Generated!",
          description: "Your AI summary has been created successfully."
        });
        
        setIsGenerating(false);
      }, 2000);
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: "Error",
        description: "Failed to generate summary. Please try again.",
        variant: "destructive"
      });
      setIsGenerating(false);
    }
  };

  const resetAll = () => {
    setAiDemoText("");
    setAiDemoResult("");
    setSelectedSummary(null);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Summary copied to clipboard."
    });
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#15192b] via-[#161c29] to-[#1b2236] text-white">
        <div className="bg-[#202741] rounded-xl p-6 shadow-lg text-center animate-fade-in">
          <span className="text-3xl">🔒</span>
          <p className="text-lg mt-4">Please sign in to access AI Summaries.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#15192b] via-[#161c29] to-[#1b2236] text-white transition-colors">
      <Navbar />

      <main className="flex-1 py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold flex items-center gap-3 mb-4 tracking-tight text-white drop-shadow">
              📄 <Brain className="h-10 w-10 text-spark-primary" />
              AI Summaries
            </h1>
            <p className="text-muted-foreground text-lg">
              Transform lengthy content into concise, intelligent summaries ✨
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6 animate-fade-in-up">
              <Card className="dark:bg-gradient-to-br dark:from-[#23294b] dark:via-[#191e32] dark:to-[#23294b] bg-card shadow-lg rounded-xl border-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Create Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <DocumentUploader />
                  
                  <div className="text-center text-muted-foreground">
                    <span>Or paste text directly</span>
                  </div>
                  
                  <Textarea
                    placeholder="Paste your text here to generate an AI summary..."
                    value={aiDemoText}
                    onChange={(e) => setAiDemoText(e.target.value)}
                    className="min-h-[200px] resize-none"
                  />
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={generateAISummary}
                      disabled={isGenerating || !aiDemoText.trim()}
                      className="flex-1"
                    >
                      {isGenerating ? (
                        <>
                          <Clock className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Summary
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={resetAll}>
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Output Section */}
            <div className="space-y-6 animate-fade-in-up">
              {aiDemoResult && (
                <Card className="dark:bg-gradient-to-br dark:from-[#23294b] dark:via-[#191e32] dark:to-[#23294b] bg-card shadow-lg rounded-xl border-none">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Generated Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm leading-relaxed">{aiDemoResult}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => copyToClipboard(aiDemoResult)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Previous Summaries */}
          {summaries.length > 0 && (
            <div className="mt-12 animate-fade-in-up">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                📚 Your Summaries ({summaries.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {summaries.map((summary) => (
                  <Card 
                    key={summary.id}
                    className="dark:bg-gradient-to-br dark:from-[#23294b] dark:via-[#191e32] dark:to-[#23294b] bg-card shadow-lg rounded-xl border-none cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setSelectedSummary(summary)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{summary.title}</CardTitle>
                      <div className="flex gap-2">
                        <Badge variant="secondary">
                          {summary.wordCount} words
                        </Badge>
                        <Badge variant="outline">
                          {new Date(summary.createdAt).toLocaleDateString()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {summary.content.slice(0, 150)}...
                      </p>
                      <Button variant="ghost" size="sm" className="mt-2">
                        <Eye className="mr-2 h-4 w-4" />
                        View Full
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Summaries;
