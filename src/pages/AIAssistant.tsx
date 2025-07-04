
import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { firebaseSecure } from "@/lib/firebase-secure";
import { Send, Trash2, Plus, Edit2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface Message {
  role: string;
  content: string;
  timestamp: Date;
}

const AIAssistant = () => {
  const [user] = useAuthState(auth);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const { toast } = useToast();

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  // Load sessions on mount
  useEffect(() => {
    if (user?.uid) {
      loadSessions();
    }
  }, [user?.uid]);

  const loadSessions = async () => {
    try {
      const sessionData = await firebaseSecure.secureQuery(`ai_sessions/${user?.uid}/chats`);
      const loadedSessions = sessionData.map((session: any) => ({
        ...session,
        createdAt: session.createdAt?.toDate ? session.createdAt.toDate() : new Date(session.createdAt),
        updatedAt: session.updatedAt?.toDate ? session.updatedAt.toDate() : new Date(session.updatedAt),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: msg.timestamp?.toDate ? msg.timestamp.toDate() : new Date(msg.timestamp)
        }))
      }));
      setSessions(loadedSessions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
      
      if (loadedSessions.length > 0 && !activeSessionId) {
        setActiveSession(loadedSessions[0].id);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const createNewSession = async () => {
    if (!user?.uid) return;

    const newSession: ChatSession = {
      id: Date.now().toString(),
      name: `Chat Session ${sessions.length + 1}`,
      messages: [{
        role: 'assistant',
        content: 'Hello! I\'m your AI Study Tutor. How can I help you understand your material better today?',
        timestamp: new Date()
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      await firebaseSecure.secureAdd(`ai_sessions/${user.uid}/chats`, newSession);
      setSessions(prev => [newSession, ...prev]);
      setActiveSession(newSession.id);
      
      toast({
        title: "New chat session created",
        description: "Ready to help with your studies!"
      });
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: "Error",
        description: "Failed to create new session",
        variant: "destructive"
      });
    }
  };

  const setActiveSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setActiveSessionId(sessionId);
      setMessages(session.messages);
    }
  };

  const updateSessionName = async (sessionId: string, newName: string) => {
    if (!user?.uid || !newName.trim()) return;

    try {
      const session = sessions.find(s => s.id === sessionId);
      if (!session) return;

      const updatedSession = { ...session, name: newName.trim(), updatedAt: new Date() };
      await firebaseSecure.secureWrite(`ai_sessions/${user.uid}/chats/${sessionId}`, updatedSession);
      
      setSessions(prev => prev.map(s => s.id === sessionId ? updatedSession : s));
      setEditingSessionId(null);
      setEditingName('');
      
      toast({
        title: "Session renamed",
        description: `Session renamed to "${newName}"`
      });
    } catch (error) {
      console.error('Error updating session name:', error);
      toast({
        title: "Error",
        description: "Failed to rename session",
        variant: "destructive"
      });
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!user?.uid) return;

    try {
      // Note: In production, you'd implement proper delete
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      if (activeSessionId === sessionId) {
        const remainingSessions = sessions.filter(s => s.id !== sessionId);
        if (remainingSessions.length > 0) {
          setActiveSession(remainingSessions[0].id);
        } else {
          setActiveSessionId(null);
          setMessages([]);
          await createNewSession();
        }
      }
      
      toast({
        title: "Session deleted",
        description: "Chat session has been removed"
      });
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const saveSession = async () => {
    if (!user?.uid || !activeSessionId) return;

    const session = sessions.find(s => s.id === activeSessionId);
    if (!session) return;

    const updatedSession = {
      ...session,
      messages: messages,
      updatedAt: new Date()
    };

    try {
      await firebaseSecure.secureWrite(`ai_sessions/${user.uid}/chats/${activeSessionId}`, updatedSession);
      setSessions(prev => prev.map(s => s.id === activeSessionId ? updatedSession : s));
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim(), timestamp: new Date() };
    const currentInput = input.trim();
    setInput('');
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentInput, model: 'gemini' })
      });

      if (!response.ok) throw new Error(`API request failed: ${response.status}`);
      const data = await response.json();
      const aiResponse = data.response || data.message || 'No response received from AI';
      
      const aiMessage: Message = { role: 'assistant', content: aiResponse, timestamp: new Date() };
      setMessages(prev => [...prev, aiMessage]);
      
      // Auto-save session
      setTimeout(saveSession, 500);
    } catch (error) {
      let errorMessage = "I'm having trouble connecting right now. ";
      if (error instanceof Error) {
        if (error.message.includes('429')) {
          errorMessage += "I'm a bit busy right now. Please try again in a moment.";
        } else {
          errorMessage += "Please try again or contact support if this continues.";
        }
      }
      setMessages(prev => [...prev, { role: 'assistant', content: errorMessage, timestamp: new Date() }]);
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

  // Create first session if none exist
  useEffect(() => {
    if (user?.uid && sessions.length === 0 && !activeSessionId) {
      createNewSession();
    }
  }, [user?.uid, sessions.length, activeSessionId]);

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Navbar />
      
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col hidden md:flex">
        <div className="p-4 border-b border-gray-800">
          <Button onClick={createNewSession} className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`group p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                activeSessionId === session.id ? 'bg-blue-600' : 'hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-between">
                {editingSessionId === session.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 h-6 text-sm bg-gray-700 border-gray-600"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          updateSessionName(session.id, editingName);
                        } else if (e.key === 'Escape') {
                          setEditingSessionId(null);
                          setEditingName('');
                        }
                      }}
                      autoFocus
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateSessionName(session.id, editingName)}
                      className="h-6 w-6 p-0"
                    >
                      <Save className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingSessionId(null);
                        setEditingName('');
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1" onClick={() => setActiveSession(session.id)}>
                      <p className="text-sm font-medium truncate">{session.name}</p>
                      <p className="text-xs text-gray-400">
                        {session.updatedAt.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSessionId(session.id);
                          setEditingName(session.name);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                        className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-800 p-4 bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">AI Learning Assistant</h1>
              <p className="text-sm text-gray-400">
                {sessions.find(s => s.id === activeSessionId)?.name || 'Select a chat session'}
              </p>
            </div>
            <div className="md:hidden">
              <Button onClick={createNewSession} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-4 rounded-lg shadow-md ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-100 border border-gray-700'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                <div className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[70%] p-4 rounded-lg bg-gray-800 border border-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-400">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-800 p-4 bg-gray-900">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your studies..."
                disabled={isLoading}
                rows={1}
                className="w-full py-3 px-4 bg-gray-800 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
                style={{
                  minHeight: '48px',
                  maxHeight: '120px',
                  overflowY: input.length > 100 ? 'auto' : 'hidden'
                }}
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 p-3 rounded-xl"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
