import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/hooks/useUser";
import { useToast } from "@/hooks/use-toast";
import { Send, Bot, User, ArrowLeft, FileText } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackToDashboardButton from "@/components/features/BackToDashboardButton";

const NotesChat = () => {
  const { noteId } = useParams();
  const { user, isLoaded } = useUser();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [note, setNote] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNoteAndMessages = async () => {
      if (!noteId || !user) return;
      setIsLoading(true);
      try {
        // Fetch note details (replace with your actual data fetching logic)
        const fetchedNote = { id: noteId, title: "Sample Note", content: "This is a sample note content." };
        setNote(fetchedNote);

        // Fetch chat messages (replace with your actual data fetching logic)
        const initialMessages = [
          { id: '1', role: 'bot', content: "Hello! How can I help you with this note?", createdAt: new Date() },
        ];
        setMessages(initialMessages);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load note and messages.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchNoteAndMessages();
    }
  }, [noteId, user, toast]);

  useEffect(() => {
    // Scroll to bottom on new messages
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !noteId || !user) return;

    const newMessage = {
      id: String(Date.now()),
      role: "user",
      content: inputMessage,
      createdAt: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Simulate AI response (replace with your actual AI logic)
      const aiResponse = {
        id: String(Date.now() + 1),
        role: "bot",
        content: `AI response to: ${inputMessage}`,
        createdAt: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, aiResponse]);
    } catch (error) {
      console.error("AI response error:", error);
      toast({
        title: "Error",
        description: "Failed to get AI response.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center text-white">
          <p className="text-lg">Please sign in to access notes chat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <BackToDashboardButton />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto space-y-6"
        >
          {/* Note Header */}
          <Card className="bg-white/5 backdrop-blur-lg border-white/10">
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-purple-400" />
                <CardTitle>{note?.title || "Loading..."}</CardTitle>
              </div>
              <Badge variant="secondary">
                Note ID: {noteId}
              </Badge>
            </CardHeader>
            <CardContent>
              <p>{note?.content || "Loading note content..."}</p>
            </CardContent>
          </Card>

          {/* Chat Interface */}
          <Card className="bg-white/5 backdrop-blur-lg border-white/10">
            <CardHeader>
              <CardTitle>Chat with AI</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px] flex flex-col">
              <ScrollArea className="flex-grow">
                <div className="space-y-4 p-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start gap-2 ${message.role === 'user' ? 'justify-end' : ''}`}
                    >
                      {message.role === 'bot' && (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src="/bot.png" alt="AI Bot" />
                          <AvatarFallback>AI</AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex flex-col text-sm">
                        <div className={`px-3 py-2 rounded-lg ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800'}`}>
                          <p>{message.content}</p>
                        </div>
                        <time className="text-xs text-gray-500 mt-1">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </time>
                      </div>
                      {message.role === 'user' && (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user?.imageUrl || ""} alt={user?.fullName || "User"} />
                          <AvatarFallback>{user?.fullName?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} /> {/* Scroll anchor */}
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="mt-4 flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-grow bg-white/10 border-white/20 text-white"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                />
                <Button onClick={handleSendMessage} disabled={isLoading}>
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default NotesChat;
