import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import NotesChat from "@/components/features/NotesChat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, MessageCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { convertClerkIdToUuid } from "@/lib/supabaseAuth";

const NotesChatPage = () => {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const { currentUser, loading } = useAuth();
  const { toast } = useToast();
  const [noteContent, setNoteContent] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/signin');
      return;
    }

    if (currentUser && noteId) {
      loadNoteContent();
    } else if (!noteId) {
      navigate('/ai-notes');
    }
  }, [currentUser, loading, noteId, navigate]);

  const loadNoteContent = async () => {
    if (!currentUser || !noteId) return;
    
    try {
      setIsLoading(true);
      setError("");
      
      const userId = convertClerkIdToUuid(currentUser.id);

      // Try study_materials
      let { data, error } = await supabase
        .from('study_materials')
        .select('title, file_name, metadata')
        .eq('clerk_user_id', currentUser.id)
        .eq('id', noteId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Try notes table
        const notesResult = await supabase
          .from('notes')
          .select('title, content')
          .eq('clerk_user_id', currentUser.id)
          .eq('id', noteId)
          .single();
        
        if (notesResult.error) {
          console.error('Error loading note:', notesResult.error);
          setError("Note not found");
          toast({
            variant: "destructive",
            title: "Note not found",
            description: "The requested note could not be found."
          });
          return;
        }
        const noteData = notesResult.data;
        setNoteTitle(noteData.title || "Untitled Note");
        setNoteContent(noteData.content || "");
      } else if (error) {
        console.error('Error loading note:', error);
        setError("Failed to load note content");
        toast({
          variant: "destructive",
          title: "Error loading note",
          description: "Could not load the note content. Please try again."
        });
        return;
      } else if (data) {
        setNoteTitle(data.title || data.file_name || "Untitled Note");
        // SAFETY: `metadata` is possibly null, string, or object
        const meta = data.metadata && typeof data.metadata === "object" ? data.metadata as Record<string, any> : {};
        const extractedText = meta && typeof meta["extractedText"] === "string" ? meta["extractedText"] : "";
        setNoteContent(extractedText || "This is a study material. Upload a document with text content for better AI responses.");
      }
      // else not found

    } catch (error) {
      console.error('Error loading note:', error);
      setError("Failed to load note");
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while loading the note."
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-[#101010] via-[#23272e] to-[#09090b] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading your note...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-bl from-[#101010] via-[#23272e] to-[#09090b] text-white">
        <Navbar />
        <main className="flex-1 py-8 px-4 pb-20 md:pb-8">
          <div className="container max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/ai-notes')}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Notes
              </Button>
            </div>
            
            <Card className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border-red-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  {error}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300">
                <p className="mb-4">The note you're looking for could not be loaded.</p>
                <Button onClick={() => navigate('/ai-notes')}>
                  Go to AI Notes Generator
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-bl from-[#101010] via-[#23272e] to-[#09090b] text-white">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/ai-notes')}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Notes
              </Button>
            </div>

            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-6 h-6 text-purple-400" />
              <h1 className="text-2xl md:text-3xl font-bold">Chat with Your Notes</h1>
            </div>
            <p className="text-gray-400">Ask your AI tutor questions about your uploaded notes and get instant help.</p>
          </motion.div>

          {noteId && (
            <NotesChat 
              noteId={noteId}
              noteContent={noteContent}
              noteTitle={noteTitle}
            />
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8"
          >
            <Card className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <MessageCircle className="w-5 h-5 text-purple-400" />
                  How to use Notes Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300">
                <ul className="space-y-2 text-sm">
                  <li>• Ask specific questions about concepts in your notes</li>
                  <li>• Request explanations of difficult topics</li>
                  <li>• Get examples and analogies to better understand the material</li>
                  <li>• Ask for practice problems or quiz questions</li>
                  <li>• Request summaries of specific sections</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default NotesChatPage;
