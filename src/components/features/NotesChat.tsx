
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Bot, User, Sparkles, X, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { ChatMessage, getChatHistory, saveChatMessage } from "@/lib/notesChat";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface NotesChatProps {
  noteId: string;
  noteContent?: string;
  noteTitle?: string;
}

const NotesChat = ({ noteId, noteContent: initialNoteContent, noteTitle: initialNoteTitle }: NotesChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const [noteContent, setNoteContent] = useState<string>(initialNoteContent ?? "");
  const [noteTitle, setNoteTitle] = useState<string>(initialNoteTitle ?? "");
  const [fileName, setFileName] = useState<string>("");
  const [contextActive, setContextActive] = useState<boolean>(true);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch note content and title for context, based on noteId and user
  useEffect(() => {
    const fetchNote = async () => {
      if (!user || !noteId) return;

      let { data, error } = await supabase
        .from('study_materials')
        .select('title,file_name,metadata')
        .eq('user_id', user.id)
        .eq('id', noteId)
        .single();

      if (data) {
        setNoteTitle(data.title || data.file_name || "Untitled Note");
        setFileName(data.file_name || "");
        const meta = data.metadata && typeof data.metadata === "object" ? data.metadata as Record<string, any> : {};
        const contextText = meta && typeof meta["extractedText"] === "string" ? meta["extractedText"] : "";
        setNoteContent(contextText);
        setContextActive(!!contextText);
        return;
      }
      // If not study_materials, try notes (AI-generated)
      if (error && error.code === "PGRST116") {
        let result = await supabase
          .from('notes')
          .select('title,content')
          .eq('user_id', user.id)
          .eq('id', noteId)
          .single();
        if (result.data) {
          setNoteTitle(result.data.title || "Untitled Note");
          setFileName("");
          setNoteContent(result.data.content || "");
          setContextActive(!!result.data.content);
        }
      }
    };

    fetchNote();
  }, [user, noteId]);

  // Load chat history from DB
  useEffect(() => {
    if (user && noteId) {
      loadChatHistory();
    }
  }, [user, noteId]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const loadChatHistory = async () => {
    if (!user) return;
    try {
      setIsLoadingHistory(true);
      const history = await getChatHistory(user.id, noteId);
      setMessages(history);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // AI Chat call, always use note context as SYSTEM prompt
  const sendMessageToAI = async (userMessage: string, chatHistory: ChatMessage[]) => {
    const messages = [];

    if (contextActive && noteContent) {
      messages.push({
        role: "system",
        content: `The user uploaded the following note. Refer to it for all answers:\n\n${noteContent}`
      });
    }

    // Add chat history (always in order)
    chatHistory.forEach(msg => {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.message
      });
    });

    // Add latest prompt
    messages.push({
      role: 'user',
      content: userMessage
    });

    // Use the same model as the notes generator
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        model: "together"
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send message');
    }
    const data = await response.json();
    return data.response;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);

    try {
      // Add user message to state immediately
      const tempUserMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        user_id: user.id,
        note_id: noteId,
        role: 'user',
        message: userMessage,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, tempUserMessage]);

      // Save to DB
      await saveChatMessage(user.id, noteId, 'user', userMessage);

      // AI response
      const aiResponse = await sendMessageToAI(userMessage, messages);

      // Show AI message
      const aiMessage: ChatMessage = {
        id: `temp-ai-${Date.now()}`,
        user_id: user.id,
        note_id: noteId,
        role: 'assistant',
        message: aiResponse,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [
        ...prev.filter(m => m.id !== tempUserMessage.id),
        { ...tempUserMessage, id: `saved-${Date.now()}` },
        aiMessage
      ]);
      // Save AI to DB
      await saveChatMessage(user.id, noteId, 'assistant', aiResponse);

    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        variant: "destructive",
        title: "Error sending message",
        description: error instanceof Error ? error.message : "Please try again"
      });

      setMessages(prev => prev.filter(m => !m.id.startsWith('temp-')));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearContext = () => {
    setContextActive(false);
    toast({
      title: "Context cleared",
      description: "The AI will no longer reference your note content in responses."
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto"
    >
      <Card className="bg-gradient-to-br from-[#232453] to-[#1a1a2e] border-[#35357a] shadow-2xl">
        <CardHeader className="border-b border-[#35357a] bg-gradient-to-r from-purple-600/20 to-blue-600/20">
          <CardTitle className="flex items-center gap-3 text-white">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <MessageCircle className="w-6 h-6 text-purple-400" />
            </motion.div>
            <div className="flex-1">
              <div className="text-lg font-bold">Chat with Your Notes</div>
              <div className="text-sm font-normal text-gray-300 opacity-80">
                {fileName ? (
                  <>Chatting with: <span className="font-semibold">{fileName}</span></>
                ) : (
                  <>Chatting with: <span className="font-semibold">{noteTitle}</span></>
                )}
              </div>
            </div>
          </CardTitle>

          {/* Context Status */}
          {contextActive && noteContent && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between bg-green-900/30 border border-green-500/30 rounded-lg p-3 mt-3"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-400" />
                <p className="text-sm text-green-400">
                  Context status: <span className="font-semibold">Active</span>
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearContext}
                className="text-green-400 hover:text-green-300 hover:bg-green-500/10 h-6 px-2"
              >
                <X className="w-3 h-3 mr-1" />
                Clear Context
              </Button>
            </motion.div>
          )}
          {!contextActive && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-orange-900/30 border border-orange-500/30 rounded-lg p-3 mt-3"
            >
              <p className="text-sm text-orange-400">
                Context inactive. AI will not use your uploaded note for reference until you reload this page.
              </p>
            </motion.div>
          )}
        </CardHeader>

        <CardContent className="p-0">
          {/* Chat Messages Area */}
          <ScrollArea className="h-[500px] p-6" ref={scrollAreaRef}>
            {isLoadingHistory ? (
              <motion.div
                className="flex items-center justify-center h-32"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex space-x-2">
                  <motion.div
                    className="w-3 h-3 bg-purple-400 rounded-full"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
                  />
                  <motion.div
                    className="w-3 h-3 bg-purple-400 rounded-full"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: 0.1 }}
                  />
                  <motion.div
                    className="w-3 h-3 bg-purple-400 rounded-full"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                  />
                </div>
              </motion.div>
            ) : messages.length === 0 ? (
              <motion.div
                className="flex flex-col items-center justify-center h-32 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="mb-4"
                >
                  <Bot className="w-16 h-16 text-purple-400" />
                </motion.div>
                <p className="text-gray-300 mb-2 text-lg font-medium">Ask your AI tutor anything about these notes!</p>
                <p className="text-sm text-gray-400">Start a conversation to get personalized help and explanations.</p>
              </motion.div>
            ) : (
              <div className="space-y-6">
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id || index}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.role === 'assistant' && (
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                          <Avatar className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 shadow-lg">
                            <AvatarFallback>
                              <Bot className="w-5 h-5 text-white" />
                            </AvatarFallback>
                          </Avatar>
                        </motion.div>
                      )}

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white ml-auto shadow-lg shadow-purple-500/25'
                            : 'bg-[#2a2a3e] text-gray-100 border border-[#35357a] shadow-lg shadow-black/20'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap mb-2">
                          {message.message}
                        </p>
                        <p className={`text-xs ${
                          message.role === 'user' ? 'text-purple-200' : 'text-gray-400'
                        }`}>
                          {formatTimestamp(message.created_at)}
                        </p>
                      </motion.div>

                      {message.role === 'user' && (
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                          <Avatar className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg">
                            <AvatarFallback>
                              <User className="w-5 h-5 text-white" />
                            </AvatarFallback>
                          </Avatar>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Loading indicator for AI response */}
                {isLoading && (
                  <motion.div
                    className="flex gap-4 justify-start"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Avatar className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 shadow-lg">
                      <AvatarFallback>
                        <Bot className="w-5 h-5 text-white" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-[#2a2a3e] border border-[#35357a] rounded-2xl px-4 py-3 shadow-lg">
                      <div className="flex space-x-2">
                        <motion.div
                          className="w-2 h-2 bg-purple-400 rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-purple-400 rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0.1 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-purple-400 rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <motion.div
            className="border-t border-[#35357a] p-6 bg-gradient-to-r from-[#1a1a2e]/50 to-[#232453]/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex gap-3 mb-4">
              <Input
                placeholder="Ask a question about your notes..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1 bg-[#2a2a3e] border-[#35357a] text-white placeholder-gray-400 focus:border-purple-400 focus:ring-purple-400/25 rounded-xl h-12 px-4 shadow-inner"
              />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white h-12 px-6 rounded-xl shadow-lg transition-all duration-200"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </motion.div>
            </div>

            {/* Generate Flashcards Button (Future) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="pt-3 border-t border-[#35357a]/50"
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  className="w-full bg-transparent border-purple-400/50 text-purple-400 hover:bg-purple-400/10 hover:border-purple-400 hover:text-purple-300 transition-all duration-200 rounded-xl h-10"
                  disabled
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Flashcards from this Chat (Coming Soon)
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default NotesChat;
