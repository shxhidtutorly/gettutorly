import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Play } from "lucide-react";

const YouTubeSummarizer: React.FC = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [usedTranscript, setUsedTranscript] = useState<boolean>(false);

  const handleSummarize = async () => {
    setError("");
    setSummary("");
    if (!url.trim()) {
      setError("Please paste a YouTube URL.");
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch("/api/youtube-summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || "Failed to summarize");
      setSummary(data.summary);
      setUsedTranscript(!!data.usedTranscript);
    } catch (e: any) {
      setError(e?.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-gray-100 font-mono">
      <Navbar />
      <main className="flex-1 py-10 px-4">
        <div className="container max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 flex items-center gap-3">
            <Play className="text-pink-500" /> AI YouTube Summarizer
          </h1>
          <p className="text-gray-400 mb-8">Paste a YouTube link and get a concise, study-friendly summary.</p>

          <div className="bg-gray-900 border-2 border-pink-500 shadow-[4px_4px_0px_#ec4899] rounded-none p-4 mb-6">
            <div className="flex gap-2">
              <Input
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-black text-white border-2 border-gray-700 rounded-none h-12 focus:border-pink-500"
              />
              <Button onClick={handleSummarize} disabled={loading} className="h-12 px-6 bg-pink-500 text-black border-2 border-pink-400 rounded-none font-black hover:bg-pink-400">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Summarize"}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Works best when captions are available. We fall back to AI reasoning if transcript is missing.</p>
          </div>

          {error && (
            <div className="bg-red-950/50 border-2 border-red-500 text-red-300 p-4 mb-6">
              {error}
            </div>
          )}

          <div className="min-h-[160px] bg-gray-900 border-2 border-yellow-400 rounded-none p-5 shadow-[4px_4px_0px_#facc15] transition-all duration-300">
            {loading ? (
              <div className="flex items-center gap-3 text-yellow-400">
                <Loader2 className="w-5 h-5 animate-spin" /> Generating summary...
              </div>
            ) : summary ? (
              <div className="space-y-2">
                {!usedTranscript && (
                  <div className="text-xs text-yellow-400">Transcript not available — used AI fallback.</div>
                )}
                <pre className="whitespace-pre-wrap leading-relaxed text-gray-200">{summary}</pre>
              </div>
            ) : (
              <div className="text-gray-500">Your summary will appear here.</div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default YouTubeSummarizer;
