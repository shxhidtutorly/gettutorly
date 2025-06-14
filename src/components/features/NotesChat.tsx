
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Bot, User, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ChatMessage, getChatHistory, saveChatMessage, sendChatMessage } from "@/lib/notesChat";

interface NotesChatProps {
  noteId: string;
  noteContent: string;
  noteTitle: string;
}

const NotesChat = ({ noteId, noteContent, noteTitle }: NotesChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // Load chat history on component mount
  useEffect(() => {
    if (currentUser && noteId) {
      loadChatHistory();
    }
  }, [currentUser, noteId]);

  // Auto scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const loadChatHistory = async () => {
    if (!currentUser) return;
    
    try {
      setIsLoadingHistory(true);
      const history = await getChatHistory(currentUser.id, noteId);
      setMessages(history);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentUser || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);

    try {
      // Add user message to state immediately
      const tempUserMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        user_id: currentUser.id,
        note_id: noteId,
        role: 'user',
        message: userMessage,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, tempUserMessage]);

      // Save user message to database
      await saveChatMessage(currentUser.id, noteId, 'user', userMessage);

      // Get AI response
      const aiResponse = await sendChatMessage(userMessage, noteContent, messages);

      // Add AI response to state
      const aiMessage: ChatMessage = {
        id: `temp-ai-${Date.now()}`,
        user_id: currentUser.id,
        note_id: noteId,
        role: 'assistant',
        message: aiResponse,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev.filter(m => m.id !== tempUserMessage.id), 
        { ...tempUserMessage, id: `saved-${Date.now()}` }, aiMessage]);

      // Save AI response to database
      await saveChatMessage(currentUser.id, noteId, 'assistant', aiResponse);

    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        variant: "destructive",
        title: "Error sending message",
        description: error instanceof Error ? error.message : "Please try again"
      });
      
      // Remove failed message from state
      setMessages(prev => prev.filter(m => !m.id.startsWith('temp-')));
    } finally {
      setIsLoading(false);
    }
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
    <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-[#232453] to-[#1a1a2e] border-[#35357a]">
      <CardHeader className="border-b border-[#35357a]">
        <CardTitle className="flex items-center gap-2 text-white">
          <MessageCircle className="w-5 h-5 text-purple-400" />
          Chat with Your Notes
          <span className="text-sm font-normal text-gray-300">- {noteTitle}</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Chat Messages Area */}
        <ScrollArea className="h-96 p-4" ref={scrollAreaRef}>
          {isLoadingHistory ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <Bot className="w-12 h-12 text-purple-400 mb-2" />
              <p className="text-gray-300 mb-1">Ask your AI tutor anything about these notes!</p>
              <p className="text-sm text-gray-400">Start a conversation to get personalized help.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={message.id || index}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  } animate-fadeIn`}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="w-8 h-8 bg-purple-600">
                      <AvatarFallback>
                        <Bot className="w-4 h-4 text-white" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={`max-w-[70%] rounded-lg px-3 py-2 ${
                      message.role === 'user'
                        ? 'bg-purple-600 text-white ml-auto'
                        : 'bg-[#2a2a3e] text-gray-100 border border-[#35357a]'
                    } shadow-lg`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.message}
                    </p>
                    <p className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-purple-200' : 'text-gray-400'
                    }`}>
                      {formatTimestamp(message.created_at)}
                    </p>
                  </div>
                  
                  {message.role === 'user' && (
                    <Avatar className="w-8 h-8 bg-blue-600">
                      <AvatarFallback>
                        <User className="w-4 h-4 text-white" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              
              {/* Loading indicator for AI response */}
              {isLoading && (
                <div className="flex gap-3 justify-start animate-fadeIn">
                  <Avatar className="w-8 h-8 bg-purple-600">
                    <AvatarFallback>
                      <Bot className="w-4 h-4 text-white" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-[#2a2a3e] border border-[#35357a] rounded-lg px-3 py-2 shadow-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-[#35357a] p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ask a question about your notes..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1 bg-[#2a2a3e] border-[#35357a] text-white placeholder-gray-400 focus:border-purple-400"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Bonus: Generate Flashcards Button */}
          <div className="mt-3 pt-3 border-t border-[#35357a]/50">
            <Button
              variant="outline"
              className="w-full bg-transparent border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white transition-all duration-200"
              disabled
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Flashcards from this Chat (Coming Soon)
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotesChat;
