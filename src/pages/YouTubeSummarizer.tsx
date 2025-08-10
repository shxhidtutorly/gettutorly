import React, { useState } from "react";
import { Loader2, Link as LinkIcon, Download } from "lucide-react";

// You must have this utility function in your project for the code to work.
// This function is expected to return an object like:
// { success: boolean, content?: string, title?: string, error?: string }
import { extractTextFromUrl } from "@/lib/jinaReader"; 

// Reusable Button Component for Brutalist Style
const BrutalistButton = ({ children, onClick, disabled, className = "" }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`h-14 px-6 flex items-center justify-center font-black uppercase border-2 text-black transition-all duration-200 ${className} ${
      disabled ? "bg-gray-600 border-gray-500 cursor-not-allowed text-gray-400" : ""
    }`}
    style={{ textShadow: "1px 1px 0px rgba(0,0,0,0.2)" }}
  >
    {children}
  </button>
);

// Main Content Importer Component
const UrlContentImporter = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState({ title: "", content: "" });

  const handleExtract = async () => {
    if (!/^https?:\/\//i.test(url)) {
      setError("Please enter a valid URL (e.g., https://...).");
      return;
    }
    setError("");
    setResult({ title: "", content: "" });
    setIsLoading(true);

    try {
      // *** FIX: Using your specific extractTextFromUrl function ***
      // This function handles the API call and response parsing, avoiding the JSON error.
      const res = await extractTextFromUrl(url);

      if (res.success && res.content) {
        setResult({
          title: res.title || url,
          content: res.content,
        });
      } else {
        // Handle failure case returned by the utility function
        throw new Error(res.error || "Failed to import from link. The content might be protected or unavailable.");
      }
    } catch (e) {
      // Catch any unexpected errors from the utility or network
      setError(e.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownload = () => {
    if(!result.content) return;
    const blob = new Blob([`Source URL: ${result.title}\n\n---\n\n${result.content}`], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    const safeTitle = (result.title || "extracted_content").replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.href = URL.createObjectURL(blob);
    link.download = `${safeTitle}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col">
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-black text-center uppercase mb-2">
            Content <span className="text-yellow-400">Importer</span>
          </h1>
          <p className="text-gray-400 text-center mb-8">
            Paste any web page link to extract its content.
          </p>

          {/* Core App */}
          <div className="border-4 border-gray-700 bg-gray-900 p-4" style={{ boxShadow: "8px 8px 0px #4b5563" }}>
            <div className="flex flex-col md:flex-row gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste any URL..."
                className="flex-1 h-14 p-4 bg-black text-white border-2 border-gray-700 focus:border-cyan-400 focus:outline-none"
              />
              <BrutalistButton 
                onClick={handleExtract} 
                disabled={isLoading}
                className="bg-yellow-400 border-yellow-300 hover:bg-yellow-300"
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Extract"}
              </BrutalistButton>
            </div>
          </div>
          
          {/* Error Display */}
          {error && (
             <div className="mt-6 border-4 border-red-500 bg-red-900/50 p-4 text-red-300 font-bold" style={{ boxShadow: "8px 8px 0px #991b1b"}}>
                <span className="font-black uppercase">Error:</span> {error}
            </div>
          )}
          
          {/* Result Display */}
          {(result.content || isLoading) && !error && (
            <div className="mt-8">
              <div className="border-4 border-cyan-400 bg-gray-900 p-1" style={{ boxShadow: "8px 8px 0px #0891b2"}}>
                <div className="bg-black p-4 min-h-[200px] flex flex-col">
                   {isLoading ? (
                     <div className="m-auto flex items-center gap-3 text-cyan-400">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="font-bold text-xl">ANALYZING...</span>
                     </div>
                   ) : (
                     <div className="flex flex-col flex-1">
                        <h2 className="text-2xl font-black uppercase text-cyan-400 mb-3 break-all">{result.title}</h2>
                        <pre className="whitespace-pre-wrap leading-relaxed text-gray-300 flex-1">{result.content}</pre>
                        <BrutalistButton onClick={handleDownload} className="mt-4 bg-cyan-400 border-cyan-300 self-end w-auto px-4 h-10">
                            <Download size={18} className="mr-2"/> Download
                        </BrutalistButton>
                     </div>
                   )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UrlContentImporter;
