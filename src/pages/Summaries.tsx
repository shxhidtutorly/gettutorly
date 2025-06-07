import { useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  FileText, 
  Brain, 
  Sparkles, 
  Copy, 
  Download, 
  Trash2, 
  Clock, 
  BookOpen,
  Zap,
  Globe,
  AlertTriangle,
  CheckCircle,
  Loader2,
  ArrowLeft
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import BackToDashboardButton from "@/components/features/BackToDashboardButton";
import SummaryUsageTracker from "@/components/features/SummaryUsageTracker";
import { motion } from "framer-motion";

const Summaries = () => {
  const [inputText, setInputText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaryTitle, setSummaryTitle] = useState("");
  const [summariesUsed, setSummariesUsed] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSummarize = async () => {
    if (!inputText.trim()) {
      setError("Please enter text to summarize.");
      return;
    }

    setError(null);
    setLoading(true);
    setSummary("");

    // Simulate AI processing
    setTimeout(() => {
      setSummary(`AI Summary: ${inputText.substring(0, 100)}...`);
      setLoading(false);
      setSummariesUsed(summariesUsed + 1);
    }, 2000);
  };

  const handleCopyToClipboard = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
      setIsCopied(true);
      toast({
        title: "Summary Copied!",
        description: "The summary has been copied to your clipboard.",
      });
      setTimeout(() => setIsCopied(false), 3000);
    }
  };

  const handleDeleteSummary = () => {
    if (summary) {
      setSummary("");
      setIsDeleted(true);
      toast({
        title: "Summary Deleted!",
        description: "The summary has been successfully deleted.",
      });
      setTimeout(() => setIsDeleted(false), 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-bl from-[#101010] via-[#23272e] to-[#09090b] text-white">
      <Navbar />
      
      <main className="flex-1 py-4 md:py-8 px-2 md:px-4 pb-20 md:pb-8">
        <div className="container max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 md:mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-4xl font-bold flex items-center gap-3">
                  <FileText className="h-8 w-8 md:h-10 md:w-10 text-blue-400" />
                  AI Summarizer
                </h1>
                <p className="text-muted-foreground text-sm md:text-base mt-2">
                  Transform any text into clear, concise summaries with AI
                </p>
              </div>

              {/* Remove children prop from BackToDashboardButton */}
              <BackToDashboardButton size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </BackToDashboardButton>
            </div>
          </motion.div>

          {/* Usage Tracker */}
          <SummaryUsageTracker summariesUsed={summariesUsed} />

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Input Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="dark:bg-card border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-base font-semibold">
                    <BookOpen className="h-4 w-4 mr-2 text-blue-400 inline-block align-middle" />
                    Enter Text to Summarize
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Paste your text here..."
                    className="min-h-[150px] border-gray-600 bg-transparent text-white focus-visible:ring-blue-500"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    ref={textareaRef}
                  />
                  <Button
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                    onClick={handleSummarize}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Summarizing...
                      </>
                    ) : (
                      <>
                        <Brain className="mr-2 h-4 w-4" />
                        Generate Summary
                      </>
                    )}
                  </Button>
                  {error && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Output Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="dark:bg-card border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-base font-semibold">
                    <FileText className="h-4 w-4 mr-2 text-green-400 inline-block align-middle" />
                    Generated Summary
                  </CardTitle>
                  <div className="space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleCopyToClipboard}
                      disabled={!summary || isCopied}
                    >
                      {isCopied ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteSummary}
                      disabled={!summary || isDeleted}
                    >
                      {isDeleted ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Deleted!
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {summary ? (
                    <div className="relative">
                      <Textarea
                        readOnly
                        className="min-h-[150px] border-gray-600 bg-transparent text-white focus-visible:ring-blue-500"
                        value={summary}
                      />
                      <Badge variant="secondary" className="absolute top-2 right-2 bg-green-600/20 text-green-400 border-green-600/30">
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI Generated
                      </Badge>
                    </div>
                  ) : (
                    <Alert variant="default">
                      <HelpCircle className="h-4 w-4" />
                      <AlertDescription>
                        Summaries will appear here. Enter your text and click
                        'Generate Summary' to get started.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Tips and Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="text-center mt-8">
              <Button
                variant="link"
                className="text-sm text-muted-foreground hover:underline"
                onClick={() => setShowTips(!showTips)}
              >
                {showTips ? "Hide Tips" : "Show Tips and Resources"}
              </Button>
            </div>

            {showTips && (
              <Card className="mt-4 dark:bg-card border-gray-700">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    <Lightbulb className="h-4 w-4 mr-2 text-yellow-400 inline-block align-middle" />
                    Tips for Effective Summaries
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <ul className="list-disc pl-5">
                    <li>
                      Start with the main idea: Identify the core message of
                      your text.
                    </li>
                    <li>
                      Focus on key details: Include only the most important
                      supporting facts.
                    </li>
                    <li>
                      Use concise language: Keep your sentences short and to
                      the point.
                    </li>
                    <li>
                      Review and edit: Ensure your summary is clear and
                      accurate.
                    </li>
                  </ul>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Summaries;
