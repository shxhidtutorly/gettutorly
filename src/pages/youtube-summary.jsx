import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Play, FileText, AlertCircle, Loader2, Sun, Moon, Sparkles, Copy, Check } from 'lucide-react';

export default function YouTubeSummary() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Initialize theme and animate in
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(savedTheme === 'dark' || (!savedTheme && systemPrefersDark));
    
    // Animate in after mount
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    
    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/youtube-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process video');
      }

      setResult(data);
    } catch (err) {
      setError(err.message || 'An error occurred while processing the video');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setUrl('');
    setResult(null);
    setError('');
    setShowTranscript(false);
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`max-w-5xl mx-auto p-6 transition-all duration-700 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        
        {/* Header Section */}
        <div className="relative mb-12">
          <div className={`relative overflow-hidden rounded-2xl p-8 transition-all duration-500 ${
            darkMode 
              ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-black border border-gray-700' 
              : 'bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-200 shadow-xl'
          }`}>
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black animate-pulse"></div>
            </div>
            
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={`absolute top-6 right-6 p-3 rounded-full transition-all duration-300 hover:scale-110 ${
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-xl transition-all duration-300 ${
                  darkMode ? 'bg-black text-white' : 'bg-black text-white'
                }`}>
                  <Play className="w-8 h-8" />
                </div>
                <div>
                  <h1 className={`text-4xl font-bold transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    YouTube AI Summary
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <Sparkles className={`w-4 h-4 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
                    <p className={`transition-colors duration-300 ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Transform any YouTube video into concise, AI-powered summaries
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className={`mb-8 transition-all duration-500 transform ${result || error ? 'scale-95' : 'scale-100'}`}>
          <div className={`rounded-2xl p-6 transition-all duration-300 ${
            darkMode 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200 shadow-lg'
          }`}>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <label className={`block text-sm font-semibold mb-3 transition-colors duration-300 ${
                  darkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  YouTube URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://youtu.be/abc123 or https://youtube.com/watch?v=abc123"
                    className={`w-full px-6 py-4 rounded-xl border-2 transition-all duration-300 focus:scale-[1.02] ${
                      darkMode 
                        ? 'bg-gray-900 border-gray-600 text-white placeholder-gray-400 focus:border-white focus:bg-black' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-black focus:bg-white'
                    } outline-none`}
                    disabled={loading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSubmit(e);
                      }
                    }}
                  />
                  {url && (
                    <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full ${
                      darkMode ? 'bg-green-400' : 'bg-green-500'
                    } animate-pulse`}></div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={loading || !url.trim()}
                  className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:scale-100 ${
                    darkMode
                      ? 'bg-white text-black hover:bg-gray-100 disabled:bg-gray-600 disabled:text-gray-400'
                      : 'bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500'
                  } disabled:cursor-not-allowed flex items-center gap-3 whitespace-nowrap shadow-lg`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Summary
                    </>
                  )}
                </button>
                
                {(result || error) && (
                  <button
                    onClick={handleClear}
                    className={`px-6 py-4 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
                      darkMode
                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Error Section */}
        {error && (
          <div className={`mb-8 animate-in slide-in-from-top-4 duration-500 ${
            darkMode ? 'text-red-400' : 'text-red-600'
          }`}>
            <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
              darkMode 
                ? 'bg-red-900/20 border-red-800 backdrop-blur-sm' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">Error</h3>
                  <p className={darkMode ? 'text-red-300' : 'text-red-700'}>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
            
            {/* Summary Section */}
            <div className={`rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.01] ${
              darkMode 
                ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' 
                : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-xl'
            }`}>
              <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <h2 className={`text-2xl font-bold flex items-center gap-3 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-black' : 'bg-black'}`}>
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    AI Summary
                  </h2>
                  <button
                    onClick={() => copyToClipboard(result.summary || '')}
                    className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                      darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    {copied ? (
                      <Check className={`w-5 h-5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                    ) : (
                      <Copy className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {result.summary ? (
                  <div className={`prose prose-lg max-w-none transition-colors duration-300 ${
                    darkMode ? 'prose-invert text-gray-200' : 'text-gray-700'
                  }`}>
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {result.summary}
                    </div>
                  </div>
                ) : (
                  <p className={`italic ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No summary available
                  </p>
                )}
                
                {result.warning && (
                  <div className={`mt-6 p-4 rounded-xl ${
                    darkMode ? 'bg-yellow-900/30 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'
                  }`}>
                    <p className={`text-sm ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                      {result.warning}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Transcript Section */}
            {result.transcript && (
              <div className={`rounded-2xl overflow-hidden transition-all duration-500 ${
                darkMode 
                  ? 'bg-gray-800 border border-gray-700' 
                  : 'bg-white border border-gray-200 shadow-lg'
              }`}>
                <button
                  onClick={() => setShowTranscript(!showTranscript)}
                  className={`w-full p-6 flex items-center justify-between text-left transition-all duration-300 ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <h2 className={`text-xl font-semibold flex items-center gap-3 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                      <FileText className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                    </div>
                    Full Transcript
                    <span className={`text-sm px-3 py-1 rounded-full ${
                      darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {result.transcript.length.toLocaleString()} chars
                    </span>
                  </h2>
                  <div className={`transform transition-transform duration-300 ${showTranscript ? 'rotate-180' : ''}`}>
                    <ChevronDown className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
                </button>
                
                <div className={`overflow-hidden transition-all duration-500 ${showTranscript ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className={`p-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className={`relative rounded-xl p-4 max-h-80 overflow-y-auto transition-colors duration-300 ${
                      darkMode ? 'bg-gray-900' : 'bg-gray-50'
                    }`}>
                      <button
                        onClick={() => copyToClipboard(result.transcript)}
                        className={`absolute top-2 right-2 p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                          darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
                        }`}
                      >
                        {copied ? (
                          <Check className={`w-4 h-4 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                        ) : (
                          <Copy className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                        )}
                      </button>
                      <p className={`text-sm leading-relaxed whitespace-pre-wrap pr-10 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {result.transcript}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className={`mt-16 p-8 rounded-2xl transition-all duration-500 ${
          darkMode 
            ? 'bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700' 
            : 'bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200'
        }`}>
          <h3 className={`font-bold text-xl mb-4 flex items-center gap-2 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-white' : 'bg-black'} animate-pulse`}></div>
            How it works
          </h3>
          <div className={`grid md:grid-cols-2 gap-4 text-sm ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            <div className="space-y-2">
              <p>• Paste any YouTube video URL above</p>
              <p>• Our AI analyzes the video's transcript</p>
              <p>• Get instant bullet-point summaries</p>
            </div>
            <div className="space-y-2">
              <p>• View complete transcripts when needed</p>
              <p>• Copy summaries with one click</p>
              <p>• Works with videos that have captions</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-in {
          animation: slideIn 0.5s ease-out;
        }
        .slide-in-from-top-4 {
          animation: slideInFromTop 0.5s ease-out;
        }
        .slide-in-from-bottom-8 {
          animation: slideInFromBottom 0.7s ease-out;
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInFromBottom {
          from {
            opacity: 0;
            transform: translateY(32px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
