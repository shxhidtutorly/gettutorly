import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Mic, Paperclip, Send } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { BackToDashboardButton } from "@/components/features/BackToDashboardButton";
import { Button } from "@/components/ui/button";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.js", import.meta.url).toString();

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export default function ChatUI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadedText, setUploadedText] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { role: "user", content: input.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const typingMessage: Message = { role: "assistant", content: "AI is thinking...", timestamp: new Date() };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMessage.content, context: uploadedText })
      });
      const data = await res.json();
      const reply: Message = { role: "assistant", content: data.response || "No response", timestamp: new Date() };
      setMessages(prev => [...prev.slice(0, -1), reply]);
    } catch (err) {
      setMessages(prev => [...prev.slice(0, -1), { role: "assistant", content: "⚠️ Failed to connect.", timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/pdf") return;
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(" ") + "\n";
    }
    setUploadedText(text);
    setMessages(prev => [...prev, { role: "system", content: `Reference document loaded: ${file.name}`, timestamp: new Date() }]);
    setToast(`${file.name} uploaded successfully`);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a0f2e] to-[#0a0a0a] text-white flex flex-col">
      <header className="sticky top-0 z-10 px-4 py-3 flex justify-between items-center border-b border-white/10 backdrop-blur">
        <h1 className="text-lg md:text-xl font-bold">✦ AI Study Assistant</h1>
        <BackToDashboardButton />
      </header>

      {toast && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="mx-auto mt-4 px-4 py-2 bg-green-900/20 text-green-300 border border-green-500/30 rounded-xl flex items-center gap-2">
          <FileText className="w-4 h-4" /> {toast}
        </motion.div>
      )}

      <main className="flex-1 overflow-y-auto p-4 max-w-3xl w-full mx-auto space-y-4">
        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`p-4 rounded-xl max-w-[80%] shadow-xl transition-transform duration-300 hover:scale-[1.01] ${
              msg.role === "user" ?
                "bg-gradient-to-br from-blue-600 to-blue-500 text-white" :
                msg.role === "assistant" ? "bg-white/5 border border-purple-600/40 backdrop-blur-sm" :
                  "bg-yellow-900/20 border border-yellow-600/20"
            }`}>
              <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
              <div className="text-xs text-gray-400 mt-2">{msg.timestamp.toLocaleTimeString()}</div>
            </div>
          </motion.div>
        ))}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="p-4 rounded-xl bg-white/5 border border-purple-600/40 backdrop-blur-sm max-w-[80%]">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <motion.div className="w-2 h-2 rounded-full bg-purple-400" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} />
                  <motion.div className="w-2 h-2 rounded-full bg-purple-400" animate={{ y: [0, -4, 0] }} transition={{ delay: 0.2, repeat: Infinity, duration: 0.6 }} />
                  <motion.div className="w-2 h-2 rounded-full bg-purple-400" animate={{ y: [0, -4, 0] }} transition={{ delay: 0.4, repeat: Infinity, duration: 0.6 }} />
                </div>
                <span className="text-sm text-gray-300">AI is thinking...</span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={endRef} />
      </main>

      <footer className="sticky bottom-0 bg-black/30 backdrop-blur-lg p-4 border-t border-white/10">
        <div className="flex items-end gap-3 max-w-3xl w-full mx-auto">
          <label className="cursor-pointer text-gray-400 hover:text-white">
            <Paperclip className="w-5 h-5" />
            <input type="file" accept="application/pdf" className="hidden" onChange={handleUpload} />
          </label>
          <Mic className="w-5 h-5 text-gray-400 hover:text-white" />
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={1}
            placeholder="Ask me anything about your studies..."
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
          />
          <Button
            onClick={handleSendMessage}
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 p-3 rounded-xl"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
