import React, { useState, useRef } from "react";
import { Loader2, FileText, Sparkles, Copy, Check } from "lucide-react";

// This component assumes you have a utility function at this path
// that returns: { success: boolean, content?: string, title?: string, error?: string }
import { extractTextFromUrl } from "@/lib/jinaReader";

// Reusable Button Component for the Brutalist Style
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

// The main, production-ready component
const AiContentProcessor = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState({ title: "", content: "", summary: "" });
  const [activeView, setActiveView] = useState("summary");
  const [hasCopied, setHasCopied] = useState(false);
  const resultRef = useRef(null);

  const handleProcessUrl = async () => {
    // --- 1. VALIDATION AND STATE RESET ---
    if (!/^https?:\/\//i.test(url)) {
      setError("Please enter a valid URL (must start with http:// or https://).");
      return;
    }
    setError("");
    setResult({ title: "", content: "", summary: "" });
    setIsLoading(true);
    if (resultRef.current) {
        resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }


    try {
      // --- 2. EXTRACT CONTENT FROM URL ---
      setLoadingStep("Extracting content...");
      const extractRes = await extractTextFromUrl(url);

      if (!extractRes.success || !extractRes.content) {
        throw new Error(extractRes.error || "Failed to extract content. The site may be protected or inaccessible.");
      }

      const extractedText = extractRes.content;
      const pageTitle = extractRes.title || url;
      
      // Temporarily set the extracted content so user sees something if summary fails
      setResult({ title: pageTitle, content: extractedText, summary: "" });

      // --- 3. CALL YOUR API TO SUMMARIZE ---
      setLoadingStep("Generating AI summary...");
      
      // This prompt is designed to get the best summary from the model
      const prompt = `You are an expert summarizer. Based on the following text extracted from a webpage, provide a concise, easy-to-read summary. Focus only on the main points and ignore any irrelevant navigation links, menus, or footer information. The summary should be presented in clean, well-structured paragraphs.

      TEXT TO SUMMARIZE:
      ---
      ${extractedText}
      ---
      
      CONCISE SUMMARY:`;

      // *** Using your specified API endpoint and request structure ***
      const summaryResponse = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: prompt,
          model: 'groq' // Using the model you specified
        })
      });

      if (!summaryResponse.ok) {
        // Try to get a specific error message from your backend
        const errorData = await summaryResponse.json().catch(() => ({}));
        throw new Error(errorData.error || `The AI service failed with status: ${summaryResponse.status}`);
      }
      
      // Assuming your API returns a JSON object like { summary: "..." } or { response: "..." }
      const summaryData = await summaryResponse.json();
      const summaryText = summaryData.summary || summaryData.response || summaryData.text;

      if (!summaryText) {
        throw new Error("AI service returned an empty response.");
      }

      setResult({ title: pageTitle, content: extractedText, summary: summaryText });
      setActiveView('summary'); // Default to showing the summary

    } catch (e) {
      setError(e.message || "An unknown error occurred during processing.");
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  const handleCopy = () => {
    if (result.summary) {
      navigator.clipboard.writeText(result.summary);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col">
      <main className="flex-1 flex items-center justify-center p-4 my-10">
        <div className="w-full max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-black text-center uppercase mb-2">
            AI Content <span className="text-yellow-400">Processor</span>
          </h1>
          <p className="text-gray-400 text-center mb-8">
            Paste a link to extract and summarize its core content instantly.
          </p>

          <div className="border-4 border-gray-700 bg-gray-900 p-4" style={{ boxShadow: "8px 8px 0px #4b5563" }}>
            <div className="flex flex-col md:flex-row gap-2">
              <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Paste any URL..." className="flex-1 h-14 p-4 bg-black text-white border-2 border-gray-700 focus:border-cyan-400 focus:outline-none"/>
              <BrutalistButton onClick={handleProcessUrl} disabled={isLoading} className="bg-yellow-400 border-yellow-300 hover:bg-yellow-300">
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Process"}
              </BrutalistButton>
            </div>
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
                         <h2 className="text-xl md:text-2xl font-black uppercase text-cyan-400 break-all">{result.title}</h2>
                         {activeView === 'summary' && result.summary && (
                            <button onClick={handleCopy} className="flex items-center gap-2 text-xs font-bold uppercase border-2 p-2 transition-colors bg-gray-800 border-gray-700 hover:bg-cyan-500 hover:text-black">
                                {hasCopied ? <><Check size={16}/> Copied</> : <><Copy size={16}/> Copy</>}
                            </button>
                         )}
                      </div>
                      <div className="flex border-b-2 border-cyan-700">
                         <button onClick={() => setActiveView('summary')} className={`flex-1 p-3 font-bold uppercase flex items-center justify-center gap-2 transition-colors ${activeView === 'summary' ? 'bg-cyan-500 text-black' : 'hover:bg-gray-800'}`}>
                            <Sparkles size={18}/> AI Summary
                         </button>
                         <button onClick={() => setActiveView('full')} className={`flex-1 p-3 font-bold uppercase border-l-2 border-cyan-700 flex items-center justify-center gap-2 transition-colors ${activeView === 'full' ? 'bg-cyan-500 text-black' : 'hover:bg-gray-800'}`}>
                            <FileText size={18}/> Full Content
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
