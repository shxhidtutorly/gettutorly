
import React, { useState, useCallback, useMemo } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { useStudyTracking } from "@/hooks/useStudyTracking";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import DocumentUploader from "@/components/features/DocumentUploader";
import NotesDisplay from "@/components/features/NotesDisplay";
import NotesChat from "@/components/features/NotesChat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Brain, Download } from "lucide-react";

const AINotesGenerator = () => {
  const [user] = useAuthState(auth); // Auth is guaranteed by ProtectedRoute
  const { trackNoteCreated } = useStudyTracking();
  
  // All state hooks at the top level
  const [generatedNotes, setGeneratedNotes] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("upload");

  // All callbacks after state
  const handleNotesGenerated = useCallback((notes: string) => {
    console.log('Notes generated for user:', user?.uid);
    setGeneratedNotes(notes);
    setActiveTab("notes");
    trackNoteCreated();
  }, [user?.uid, trackNoteCreated]);

  const handleFileUploaded = useCallback((file: File) => {
    console.log('File uploaded:', file.name);
    setUploadedFile(file);
  }, []);

  // Memoized values
  const hasNotes = useMemo(() => generatedNotes.length > 0, [generatedNotes]);
  const canChat = useMemo(() => hasNotes && generatedNotes, [hasNotes, generatedNotes]);

  // Create a mock note object for NotesDisplay component
  const noteForDisplay = useMemo(() => ({
    id: `note-${Date.now()}`,
    title: uploadedFile?.name || "Generated Notes",
    content: generatedNotes,
    filename: uploadedFile?.name || "document",
    timestamp: new Date().toISOString()
  }), [generatedNotes, uploadedFile]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-white">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 pb-20 md:pb-8">
        <div className="container max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Brain className="h-8 w-8 text-purple-400" />
              AI Notes Generator
            </h1>
            <p className="text-gray-400">Upload documents and generate intelligent study notes</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-[#1A1A1A] border border-slate-700">
              <TabsTrigger value="upload" className="data-[state=active]:bg-purple-600">
                Upload
              </TabsTrigger>
              <TabsTrigger value="notes" disabled={!hasNotes} className="data-[state=active]:bg-purple-600">
                Notes
              </TabsTrigger>
              <TabsTrigger value="chat" disabled={!canChat} className="data-[state=active]:bg-purple-600">
                Chat
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              <Card className="bg-[#121212] border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-400" />
                    Document Upload
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DocumentUploader
                    onNotesGenerated={handleNotesGenerated}
                    onFileUploaded={handleFileUploaded}
                    isGenerating={isGenerating}
                    setIsGenerating={setIsGenerating}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="space-y-6">
              {hasNotes && (
                <Card className="bg-[#121212] border-slate-700">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-green-400" />
                      Generated Notes
                    </CardTitle>
                    <Button variant="outline" size="sm" className="border-slate-600">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <NotesDisplay 
                      note={noteForDisplay}
                      onFlashcardsGenerated={(flashcards) => {
                        console.log('Flashcards generated:', flashcards);
                      }}
                    />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="chat" className="space-y-6">
              {canChat && (
                <Card className="bg-[#121212] border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Chat with Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <NotesChat 
                      noteId={noteForDisplay.id}
                      noteContent={generatedNotes}
                      noteTitle={noteForDisplay.title}
                    />
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default AINotesGenerator;
