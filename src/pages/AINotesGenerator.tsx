
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import FileUploader from "@/components/features/FileUploader";
import NotesDisplay from "@/components/features/NotesDisplay";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Loader2, Download, Sparkles, RefreshCcw, MessageCircle, Upload, FileText, Send } from "lucide-react";
import { ExtractionResult } from "@/lib/fileExtractor";
import { generateNotesAI, AINote, Flashcard } from "@/lib/aiNotesService";
import { useStudyTracking } from "@/hooks/useStudyTracking";
import { useHistory } from "@/hooks/useHistory";
import { DownloadNotesButton } from "@/components/features/DownloadNotesButton";
import { BackToDashboardButton } from "@/components/features/BackToDashboardButton";
import { QuizFromNotesButton } from "@/components/features/QuizFromNotesButton";

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AINotesGenerator = () => {
  const [user] = useAuthState(auth);
  const [extractedFile, setExtractedFile] = useState<ExtractionResult | null>(null);
  const [note, setNote] = useState<AINote | null>(null);
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [notesProgress, setNotesProgress] = useState(0);
  const [textInput, setTextInput] = useState("");
  const [activeTab, setActiveTab] = useState("upload");
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const { trackNotesCreation, endSession, startSession } = useStudyTracking();
  const { addHistoryEntry } = useHistory('notes');
  const { toast } = useToast();

  const handleFileProcessed = async (result: ExtractionResult) => {
    setExtractedFile(result);
    startSession();
    await generateNotes(result);
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) {
      toast({
        variant: "destructive",
        title: "Please enter some text to generate notes from"
      });
      return;
    }

    const result: ExtractionResult = {
      text: textInput.trim(),
      filename: "Text Input",
      fileType: "text"
    };

    setExtractedFile(result);
    startSession();
    await generateNotes(result);
  };

  const generateNotes = async (fileResult: ExtractionResult) => {
    setIsGeneratingNotes(true);
    setNotesProgress(10);

    try {
      setNotesProgress(30);
      const generatedNote = await generateNotesAI(fileResult.text, fileResult.filename, user?.uid || "");
      setNotesProgress(80);

      setNote(generatedNote);
      setNotesProgress(100);

      // Add to history
      await addHistoryEntry(
        `Source: ${fileResult.filename}`,
        generatedNote.content,
        { title: generatedNote.title, type: 'notes_generation' }
      );

      trackNotesCreation();
      endSession("notes", generatedNote.title, true);

      setTimeout(() => setNotesProgress(0), 1000);

      toast({
        title: "Notes generated successfully! 🎉",
        description: "Your AI-powered study notes are ready.",
      });
    } catch (error) {
      console.error("Error generating notes:", error);
      setNotesProgress(0);
      endSession("notes", fileResult.filename, false);
      toast({
        variant: "destructive",
        title: "Error generating notes",
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || !note) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    const currentInput = chatInput.trim();
    setChatInput("");
    setIsChatLoading(true);

    try {
      // Simulate AI response - in production, you'd call your AI service
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `Based on these notes: "${note.content}"\n\nUser question: ${currentInput}`,
          model: 'gemini'
        })
      });

      if (!response.ok) throw new Error('Failed to get AI response');
      const data = await response.json();
      
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: data.response || data.message || 'I apologize, but I had trouble processing your question.',
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiMessage]);

      // Add chat to history
      await addHistoryEntry(
        currentInput,
        aiMessage.content,
        { type: 'notes_chat', notesTitle: note.title }
      );

    } catch (error) {
      console.error('Error in chat:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'I apologize, but I had trouble processing your question. Please try again.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const generateFlashcardsFromChat = async () => {
    if (chatMessages.length === 0) return;

    const flashcards: Flashcard[] = chatMessages
      .filter(msg => msg.role === 'user')
      .slice(-5) // Last 5 user questions
      .map((msg, idx) => {
        const aiResponse = chatMessages.find((aiMsg, aiIdx) => 
          aiMsg.role === 'assistant' && 
          chatMessages.indexOf(aiMsg) > chatMessages.indexOf(msg)
        );
        
        return {
          id: `chat-${idx}`,
          front: msg.content,
          back: aiResponse?.content || 'No response available'
        };
      });

    // Save flashcards to localStorage for the flashcards page
    localStorage.setItem('flashcards', JSON.stringify(flashcards));
    localStorage.setItem('flashcards-source', `Chat: ${note?.title || 'AI Notes'}`);

    toast({
      title: "Flashcards created! 📚",
      description: `Generated ${flashcards.length} flashcards from your chat history.`,
    });
  };

  const startOver = () => {
    setExtractedFile(null);
    setNote(null);
    setNotesProgress(0);
    setTextInput("");
    setShowChat(false);
    setChatMessages([]);
    setActiveTab("upload");
  };

  return (
    <div
      className="min-h-screen flex flex-col text-white relative"
      style={{
        background: "linear-gradient(135deg, #232946 0%, #18122B 100%)",
        transition: "background 0.5s",
      }}
    >
      <Navbar />

      <main className="flex-1 py-4 md:py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-6xl mx-auto">
          {/* Back button */}
          <div className="mb-4 flex items-center">
            <BackToDashboardButton />
          </div>

          <div className="text-center mb-6 md:mb-8 animate-fadeInDown transition-all duration-300">
            <div className="flex items-center justify-center mb-4">
              <span className="text-2xl md:text-3xl mr-2" role="img" aria-label="sparkles">✨</span>
              <BookOpen className="h-6 w-6 md:h-8 md:w-8 mr-3 text-primary" />
              <h1 className="text-2xl md:text-3xl font-black text-white drop-shadow-sm tracking-wide">
                AI Notes Generator
              </h1>
              <span className="text-2xl md:text-3xl ml-2" role="img" aria-label="books">📚</span>
            </div>
            <p className="max-w-2xl mx-auto text-sm md:text-base font-medium text-white/80">
              Turn any study file or text into detailed AI-powered notes, flashcards, and quizzes — all in one place.
            </p>
          </div>

          {!extractedFile && !note && (
            <div
              className="animate-fadeInUp mb-6 md:mb-8"
              style={{
                boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.25)",
                borderRadius: "1.25rem",
                background: "rgba(255,255,255,0.01)",
                backdropFilter: "blur(6px)",
              }}
            >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-black/20">
                  <TabsTrigger value="upload" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    <span className="hidden sm:inline">Upload File</span>
                    <span className="sm:hidden">Upload</span>
                  </TabsTrigger>
                  <TabsTrigger value="text" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Paste Text</span>
                    <span className="sm:hidden">Text</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload">
                  <FileUploader
                    onFileProcessed={handleFileProcessed}
                    isProcessing={isGeneratingNotes}
                  />
                </TabsContent>
                
                <TabsContent value="text" className="space-y-4">
                  <Card className="bg-black/20 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Paste Your Text
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Textarea
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Paste your study material, lecture notes, or any text content here..."
                        className="min-h-[200px] resize-none bg-black/30 border-slate-600 text-white"
                        disabled={isGeneratingNotes}
                      />
                      <Button
                        onClick={handleTextSubmit}
                        disabled={isGeneratingNotes || !textInput.trim()}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        {isGeneratingNotes ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate AI Notes
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {isGeneratingNotes && (
            <div className="max-w-2xl mx-auto mb-8">
              <div className="text-center mb-4">
                <Loader2 className="w-8 h-8 md:w-12 md:h-12 animate-spin mx-auto mb-2 text-yellow-400" />
                <h3 className="text-lg md:text-xl font-bold tracking-wide">
                  Creating AI Notes... <span role="img" aria-label="robot">🤖</span>
                </h3>
                <p className="text-white/70 text-sm md:text-base">
                  {notesProgress < 30
                    ? "Thinking... 🤔"
                    : notesProgress < 80
                    ? "Structuring Notes... 📝"
                    : "Generating with AI... 🚀"}
                </p>
              </div>
              <Progress value={notesProgress} className="h-3 bg-gradient-to-r from-yellow-400 to-pink-500" />
            </div>
          )}

          {note && (
            <div className="space-y-6 md:space-y-8 animate-fadeInUp">
              <div className="flex flex-col md:flex-row gap-4 justify-center items-center flex-wrap">
                <DownloadNotesButton
                  content={note.content}
                  filename={note.title}
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Download Notes</span>
                  <span className="sm:hidden">Download</span>
                </DownloadNotesButton>
                
                <Button
                  onClick={() => setShowChat(!showChat)}
                  variant="outline"
                  className="flex items-center gap-2 border-blue-500 text-blue-400 hover:bg-blue-500/10"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Chat With Notes</span>
                  <span className="sm:hidden">Chat</span>
                </Button>
                
                <QuizFromNotesButton
                  notesContent={note.content}
                  notesTitle={note.title}
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">Generate Quiz</span>
                  <span className="sm:hidden">Quiz</span>
                </QuizFromNotesButton>
                
                <Button
                  onClick={startOver}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCcw className="w-4 h-4" />
                  <span className="hidden sm:inline">Upload Another</span>
                  <span className="sm:hidden">New</span>
                </Button>
              </div>

              {/* Chat Section */}
              {showChat && (
                <Card className="bg-black/20 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-blue-400" />
                        Chat With Your Notes
                      </div>
                      {chatMessages.some(msg => msg.role === 'user') && (
                        <Button
                          onClick={generateFlashcardsFromChat}
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">Create Flashcards</span>
                          <span className="sm:hidden">Cards</span>
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Chat Messages */}
                    <div className="max-h-64 md:max-h-80 overflow-y-auto space-y-3 mb-4">
                      {chatMessages.length === 0 ? (
                        <div className="text-center text-gray-400 py-8">
                          <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm md:text-base">Ask questions about your notes to start a conversation!</p>
                        </div>
                      ) : (
                        chatMessages.map((message, idx) => (
                          <div
                            key={idx}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-lg text-sm md:text-base ${
                                message.role === 'user'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-700 text-gray-100'
                              }`}
                            >
                              {message.content}
                            </div>
                          </div>
                        ))
                      )}
                      {isChatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-gray-700 p-3 rounded-lg flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">AI is thinking...</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Chat Input */}
                    <div className="flex gap-2">
                      <Textarea
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask a question about your notes..."
                        className="flex-1 min-h-[60px] resize-none bg-black/30 border-slate-600 text-white text-sm md:text-base"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleChatSubmit();
                          }
                        }}
                      />
                      <Button
                        onClick={handleChatSubmit}
                        disabled={!chatInput.trim() || isChatLoading}
                        className="bg-blue-600 hover:bg-blue-700 px-4"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <NotesDisplay
                note={note}
                onFlashcardsGenerated={() => {}}
              />
            </div>
          )}
        </div>
      </main>

      <Footer />
      <BottomNav />

      <style>{`
        @keyframes fadeInDown {
          0% { opacity: 0; transform: translateY(-32px);}
          100% { opacity: 1; transform: translateY(0);}
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(32px);}
          100% { opacity: 1; transform: translateY(0);}
        }
        .animate-fadeInDown {
          animation: fadeInDown 0.85s;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.85s;
        }
      `}</style>
    </div>
  );
};

export default AINotesGenerator;
