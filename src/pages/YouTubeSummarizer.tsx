import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google AI client with your API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { text } = req.body;

  if (!text || text.trim().length < 50) {
    return res.status(400).json({ error: 'Not enough text provided to summarize.' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // A clear, direct prompt for better results
    const prompt = `Please provide a concise, easy-to-read summary of the following text extracted from a webpage. Focus on the main points and ignore any irrelevant navigation links, menus, or footer information. Present the summary in clean paragraphs.

    TEXT TO SUMMARIZE:
    ---
    ${text}
    ---
    
    CONCISE SUMMARY:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();
    
    res.status(200).json({ summary });

  } catch (error) {
    console.error("Error summarizing text:", error);
    res.status(500).json({ error: "Failed to generate summary." });
  }
}
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
