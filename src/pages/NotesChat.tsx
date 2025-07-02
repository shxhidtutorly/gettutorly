
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useUser } from "@/hooks/useUser";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, ArrowLeft } from "lucide-react";
import { BackToDashboardButton } from "@/components/features/BackToDashboardButton";
import { supabase } from "@/integrations/supabase/client";

interface ChatMessage {
  id: string;
  message: string;
  created_at: string;
  role: string;
}

const NotesChat = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (noteId && user) {
      fetchMessages();
    }
  }, [noteId, user]);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("note_chats")
        .select("*")
        .eq("note_id", noteId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        toast({
          title: "Error",
          description: "Failed to load messages. Please check console for details.",
          variant: "destructive",
        });
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages. Please check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !noteId || !user) return;

    try {
      const { data, error } = await supabase
        .from("note_chats")
        .insert([
          {
            note_id: noteId,
            user_id: user.id,
            message: input,
            role: "user",
          },
        ])
        .select("*")
        .single();

      if (error) {
        console.error("Error sending message:", error);
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setMessages((prevMessages) => [...prevMessages, data]);
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#15192b] via-[#161c29] to-[#1b2236] text-white transition-colors">
      <Navbar />

      <main className="flex-1 py-8 px-4">
        <div className="container max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between animate-fade-in">
            <div>
              <BackToDashboardButton>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Notes
              </BackToDashboardButton>
              <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow mt-2">
                💬 Chat with Note
              </h1>
              <p className="text-muted-foreground text-lg">
                Discuss and clarify content of the note
              </p>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="mb-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Loading messages...</p>
              </div>
            ) : (
              messages.map((message) => (
                <Card
                  key={message.id}
                  className={`mb-3 ${
                    message.role === 'user' ? "bg-secondary text-secondary-foreground" : "bg-muted"
                  }`}
                >
                  <CardContent className="py-2 px-3 text-sm">
                    {message.message}
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Chat Input */}
          <div className="flex items-center animate-fade-in">
            <Input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="bg-background border-input text-white"
            />
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={handleSend} className="ml-2">
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default NotesChat;
