import React, { useState, useRef } from "react";
import { Loader2, FileText, Sparkles, Copy, Check, Youtube, Globe, ArrowLeft } from "lucide-react";
import { extractTextFromUrl } from "@/lib/jinaReader";
import { fetchYoutubeTranscript } from "@/lib/youtubeTranscript";

// Reusable Brutalist Button
const BrutalistButton = ({ children, onClick, disabled, className = "", ...props }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`h-14 px-6 flex items-center justify-center font-black uppercase border-2 text-black transition-all duration-200 transform active:translate-y-px ${className} ${
      disabled ? "bg-gray-700 border-gray-600 cursor-not-allowed text-gray-500" : ""
    }`}
    style={{ textShadow: "1px 1px 0px rgba(0,0,0,0.2)" }}
    {...props}
  >
    {children}
  </button>
);

const isValidHttpUrl = (u) => /^https?:\/\//i.test(u);

const isYoutubeUrl = (u) => {
  try {
    const url = new URL(u);
    const host = url.hostname.replace(/^www\./, '');
    return ['youtube.com', 'youtu.be', 'm.youtube.com'].includes(host);
  } catch {
    return false;
  }
};

const AiContentProcessor = () => {
  const [mode, setMode] = useState("web"); // "web" | "youtube"
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState({ title: "", content: "", summary: "" });
  const [activeView, setActiveView] = useState("summary");
  const [hasCopied, setHasCopied] = useState(false);
  const resultRef = useRef(null);

  const smoothScrollToResult = () => {
    if (resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const summarizeWithAI = async (title, text, kindLabel) => {
    setLoadingStep("Generating AI summary...");
    const prompt = `You are an expert summarizer. Summarize the following ${kindLabel} into clear, concise paragraphs with the key points, keeping it factual and skimmable. Avoid menus, timestamps, or fluff.

TITLE: ${title}
---
${text}
---
CONCISE SUMMARY:`;

    const resp = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, model: 'groq' })
    });

    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}));
      throw new Error(data.error || `The AI service failed (${resp.status})`);
    }

    const data = await resp.json();
    const summaryText = data.summary || data.response || data.text;
    if (!summaryText) throw new Error("AI service returned an empty response.");

    return summaryText;
  };

  const handleProcess = async () => {
    // reset UI
    setError("");
    setResult({ title: "", content: "", summary: "" });
    setActiveView("summary");

    // validation
    if (!isValidHttpUrl(url)) {
      setError("Please enter a valid URL (must start with http:// or https://).");
      return;
    }
    if (mode === "youtube" && !isYoutubeUrl(url)) {
      setError("Please enter a valid YouTube URL (youtube.com or youtu.be).");
      return;
    }

    setIsLoading(true);
    smoothScrollToResult();

    try {
      if (mode === "web") {
        // 1) Extract content from generic web page
        setLoadingStep("Extracting content...");
        const extractRes = await extractTextFromUrl(url);
        if (!extractRes?.success || !extractRes?.content) {
          throw new Error(extractRes?.error || "Failed to extract content. The site may be protected or inaccessible.");
        }

        const extractedText = extractRes.content;
        const pageTitle = extractRes.title || url;

        // show content immediately in case summary fails
        setResult({ title: pageTitle, content: extractedText, summary: "" });

        // 2) Summarize
        const summary = await summarizeWithAI(pageTitle, extractedText, "webpage content");
        setResult({ title: pageTitle, content: extractedText, summary });
      } else {
        // mode === "youtube"
        setLoadingStep("Fetching YouTube transcript...");
        const data = await fetchYoutubeTranscript(url);
        const transcriptText = data.transcriptText || "";
        if (!transcriptText) throw new Error("Transcript is empty.");

        const title = `YouTube Transcript • ${data.videoId || ''}`.trim();

        // show transcript immediately
        setResult({ title, content: transcriptText, summary: "" });

        // Summarize transcript
        const summary = await summarizeWithAI(title, transcriptText, "YouTube transcript");
        setResult({ title, content: transcriptText, summary });
      }
    } catch (e) {
      setError(e.message || "An unknown error occurred during processing.");
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  const handleCopy = () => {
    if (activeView === 'summary' && result.summary) {
      navigator.clipboard.writeText(result.summary);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col">
      {/* Top Bar with Back to Dashboard */}
      <header className="w-full border-b-4 border-gray-800 bg-gray-900/70 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto p-3 flex items-center justify-between">
          <a href="/dashboard" className="flex items-center gap-2 text-sm font-black uppercase border-2 border-gray-700 px-3 py-2 hover:bg-yellow-400 hover:text-black transition-colors" style={{ boxShadow: "4px 4px 0px #4b5563" }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </a>
          <div className="text-xs text-gray-400">AI Content <span className="text-yellow-400 font-black">Processor</span></div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 my-8">
        <div className="w-full max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-black text-center uppercase mb-2">
            AI Content <span className="text-yellow-400">Processor</span>
          </h1>
          <p className="text-gray-400 text-center mb-8">
            Extract and summarize from a <span className="text-white">web page</span> or a <span className="text-white">YouTube video</span>.
          </p>

          {/* Mode Toggle */}
          <div className="mb-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => setMode("web")}
              className={`h-12 font-black uppercase border-2 transition-all ${mode === "web" ? "bg-cyan-500 text-black border-cyan-400" : "bg-gray-900 text-white border-gray-700 hover:bg-gray-800"}`}
              style={{ boxShadow: "6px 6px 0px #0e7490" }}
            >
              <div className="flex items-center justify-center gap-2"><Globe size={18}/> Web Page</div>
            </button>
            <button
              onClick={() => setMode("youtube")}
              className={`h-12 font-black uppercase border-2 transition-all ${mode === "youtube" ? "bg-red-500 text-black border-red-400" : "bg-gray-900 text-white border-gray-700 hover:bg-gray-800"}`}
              style={{ boxShadow: "6px 6px 0px #991b1b" }}
            >
              <div className="flex items-center justify-center gap-2"><Youtube size={18}/> YouTube Transcript
              </div>
            </button>
          </div>

          {/* Input + Action */}
          <div className="border-4 border-gray-700 bg-gray-900 p-4" style={{ boxShadow: "8px 8px 0px #4b5563" }}>
            <div className="flex flex-col md:flex-row gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={mode === "web" ? "Paste any webpage URL..." : "Paste a YouTube URL..."}
                className="flex-1 h-14 p-4 bg-black text-white border-2 border-gray-700 focus:border-cyan-400 focus:outline-none"
              />
              <BrutalistButton
                onClick={handleProcess}
                disabled={isLoading}
                className={`${
                  mode === "web"
                    ? "bg-yellow-400 border-yellow-300 hover:bg-yellow-300"
                    : "bg-red-500 border-red-400 hover:bg-red-400"
                }`}
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (mode === "web" ? "Process Page" : "Get Transcript")}
              </BrutalistButton>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {mode === "web"
                ? "We extract readable content and summarize it."
                : "We fetch the video’s transcript (if available) and summarize it."}
            </p>
          </div>

          <div ref={resultRef} className="mt-8">
            {error && (
              <div className="border-4 border-red-500 bg-red-900/50 p-4 text-red-300 font-bold" style={{ boxShadow: "8px 8px 0px #991b1b"}}>
                <span className="font-black uppercase">Error:</span> {error}
              </div>
            )}

            {(isLoading || result.content) && !error && (
              <div className="border-4 border-cyan-400 bg-gray-900 p-1" style={{ boxShadow: "8px 8px 0px #0891b2"}}>
                {isLoading ? (
                  <div className="bg-black p-4 min-h-[250px] flex flex-col justify-center items-center">
                    <div className="flex items-center gap-3 text-cyan-400">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <span className="font-bold text-2xl uppercase">{loadingStep}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-black">
                    <div className="p-4 flex justify-between items-center border-b-2 border-cyan-700">
                      <h2 className="text-xl md:text-2xl font-black uppercase text-cyan-400 break-all">
                        {result.title}
                      </h2>
                      {activeView === 'summary' && result.summary && (
                        <button
                          onClick={handleCopy}
                          className="flex items-center gap-2 text-xs font-bold uppercase border-2 p-2 transition-colors bg-gray-800 border-gray-700 hover:bg-cyan-500 hover:text-black"
                        >
                          {hasCopied ? <><Check size={16}/> Copied</> : <><Copy size={16}/> Copy</>}
                        </button>
                      )}
                    </div>

                    <div className="flex border-b-2 border-cyan-700">
                      <button
                        onClick={() => setActiveView('summary')}
                        className={`flex-1 p-3 font-bold uppercase flex items-center justify-center gap-2 transition-colors ${activeView === 'summary' ? 'bg-cyan-500 text-black' : 'hover:bg-gray-800'}`}
                      >
                        <Sparkles size={18}/> AI Summary
                      </button>
                      <button
                        onClick={() => setActiveView('full')}
                        className={`flex-1 p-3 font-bold uppercase border-l-2 border-cyan-700 flex items-center justify-center gap-2 transition-colors ${activeView === 'full' ? 'bg-cyan-500 text-black' : 'hover:bg-gray-800'}`}
                      >
                        <FileText size={18}/> {mode === 'youtube' ? 'Transcript' : 'Full Content'}
                      </button>
                    </div>

                    <div className="p-5 min-h-[250px] max-h-[60vh] overflow-y-auto">
                      <pre className="whitespace-pre-wrap leading-relaxed text-gray-300 text-base">
                        {activeView === 'summary' ? (result.summary || "No summary was generated.") : result.content}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AiContentProcessor;
