import React, { useState } from "react";
import { Loader2, Link, Youtube, FileText, Download } from "lucide-react";

// Reusable Button Component for Brutalist Style
const BrutalistButton = ({ children, onClick, disabled, className = "" }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full h-14 px-6 flex items-center justify-center font-black uppercase border-2 text-black transition-all duration-200 ${className} ${
      disabled ? "bg-gray-600 border-gray-500 cursor-not-allowed" : ""
    }`}
    style={{ textShadow: "1px 1px 0px rgba(0,0,0,0.2)" }}
  >
    {children}
  </button>
);

// Main Content Extractor Component
const ContentExtractor = () => {
  const [activeTab, setActiveTab] = useState("youtube");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState({ title: "", content: "" });

  const handleExtract = async () => {
    if (!/^https?:\/\//i.test(url)) {
      setError("Please enter a valid URL.");
      return;
    }
    setError("");
    setResult({ title: "", content: "" });
    setIsLoading(true);

    try {
      // API endpoint can be dynamic based on the active tab if needed
      const apiEndpoint = activeTab === 'youtube' ? "/api/youtube-summarize" : "/api/extract-text";
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to extract content from the link.");
      }

      setResult({
        title: data.title || "Extracted Content",
        content: data.summary || data.content,
      });

    } catch (e) {
      setError(e.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
      setUrl("");
    }
  };
  
  const handleDownload = () => {
    if(!result.content) return;
    const blob = new Blob([`Title: ${result.title}\n\n${result.content}`], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${result.title.replace(/ /g, "_")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const renderTabs = () => (
    <div className="grid grid-cols-3 gap-2 mb-4">
      <button
        onClick={() => setActiveTab("youtube")}
        className={`p-3 border-2 font-bold uppercase flex items-center justify-center gap-2 ${activeTab === 'youtube' ? 'bg-pink-500 text-black border-pink-400' : 'bg-gray-800 border-gray-700 text-white'}`}
      >
        <Youtube size={18} /> YouTube
      </button>
      <button
        onClick={() => setActiveTab("link")}
        className={`p-3 border-2 font-bold uppercase flex items-center justify-center gap-2 ${activeTab === 'link' ? 'bg-cyan-400 text-black border-cyan-300' : 'bg-gray-800 border-gray-700 text-white'}`}
      >
        <Link size={18} /> Link
      </button>
      <button
        onClick={() => setActiveTab("file")}
        disabled
        className="p-3 border-2 font-bold uppercase flex items-center justify-center gap-2 bg-gray-900 border-gray-700 text-gray-500 cursor-not-allowed"
      >
        <FileText size={18} /> File
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col">
      {/* <Navbar /> You can add your navbar here */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-black text-center uppercase mb-2">
            Content <span className="text-yellow-400">Extractor</span>
          </h1>
          <p className="text-gray-400 text-center mb-8">
            Import from YouTube, Web Pages, and more.
          </p>

          {/* Core App */}
          <div className="border-4 border-gray-700 bg-gray-900 p-4" style={{ boxShadow: "8px 8px 0px #4b5563" }}>
            {renderTabs()}
            
            <div className="flex flex-col md:flex-row gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={activeTab === 'youtube' ? "Paste a YouTube URL..." : "Paste any URL..."}
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
          {(result.content || isLoading) && (
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
                        <h2 className="text-2xl font-black uppercase text-cyan-400 mb-3">{result.title}</h2>
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
      {/* <Footer /> You can add your footer here */}
    </div>
  );
};

export default ContentExtractor;
