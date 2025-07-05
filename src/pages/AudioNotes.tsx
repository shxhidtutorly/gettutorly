import React, { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { AudioNotesUploader } from "@/components/features/AudioNotesUploader";
import { ArrowLeft, Upload, Mic, MicOff } from "lucide-react";

const AudioNotes = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  
  // Typing animation states
  const [currentTypeIndex, setCurrentTypeIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  
  const typingTexts = [
    "Ready to record?",
    "Transcribing…",
    "Generating notes…",
    "Done!"
  ];
  
  useEffect(() => {
    if (!isTyping || isProcessing) return;
    
    const currentFullText = typingTexts[currentTypeIndex];
    
    if (currentText.length < currentFullText.length) {
      const timeout = setTimeout(() => {
        setCurrentText(currentFullText.slice(0, currentText.length + 1));
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setCurrentText("");
        setCurrentTypeIndex((prev) => (prev + 1) % typingTexts.length);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [currentText, currentTypeIndex, isTyping, isProcessing]);
  
  const handleUpload = () => {
    setIsTyping(false);
    setIsProcessing(true);
    setProgress(0);
    
    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setShowNotes(true);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };
  
  const handleRecord = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      handleUpload();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#15192b] via-[#161c29] to-[#1b2236] text-white relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#ffd600] rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-[#4a90e2] rounded-full animate-ping"></div>
        <div className="absolute top-1/2 left-1/3 w-1.5 h-1.5 bg-[#f9484a] rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-[#ffd600] rounded-full animate-ping delay-500"></div>
      </div>
      
      <Navbar />
      
      {/* Top bar with back button */}
      <div className="w-full max-w-6xl mx-auto flex justify-between items-center mt-4 md:mt-6 mb-2 px-4 md:px-6 z-10">
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#21253a]/80 hover:bg-[#262a42]/90 transition-all duration-300 font-semibold shadow-lg border border-[#ffd600]/20 hover:border-[#ffd600]/40 text-white text-sm md:text-base backdrop-blur-sm hover:transform hover:-translate-y-0.5 hover:shadow-xl"
          onClick={() => navigate("/dashboard")}
          aria-label="Go back to dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden xs:inline">Back to Dashboard</span>
          <span className="inline xs:hidden">Back</span>
        </button>
      </div>

      <main className="flex-1 py-4 md:py-8 px-4 md:px-6 pb-24 md:pb-8 relative z-10">
        <div className="w-full max-w-4xl mx-auto">
          {/* Glassmorphism card */}
          <div className="bg-[#202741]/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-6 md:p-12 relative overflow-hidden">
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#ffd600]/5 via-transparent to-[#4a90e2]/5 pointer-events-none"></div>
            
            {/* Header with typing effect */}
            <div className="text-center mb-8 md:mb-12 relative z-10">
              <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#ffd600] via-[#f9484a] to-[#4a90e2] drop-shadow-lg">
                Audio Notes
              </h1>
              
              {/* Typing animation or processing status */}
              <div className="h-8 md:h-10 flex items-center justify-center">
                {isProcessing ? (
                  <div className="flex items-center gap-2" aria-live="polite">
                    <span className="text-lg md:text-xl text-gray-300 font-medium">
                      Transcribing… Generating Notes…
                    </span>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-[#ffd600] rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-[#ffd600] rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-[#ffd600] rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                ) : showNotes ? (
                  <h2 className="text-lg md:text-xl text-gray-300 font-medium" aria-live="polite">
                    Audio Notes
                  </h2>
                ) : (
                  <h2 className="text-lg md:text-xl text-gray-300 font-medium min-h-[2rem] flex items-center justify-center" aria-live="polite">
                    {currentText}
                    <span className="ml-1 animate-pulse">|</span>
                  </h2>
                )}
              </div>
              
              <p className="text-gray-300 text-sm md:text-lg mt-2 font-medium">
                Record your lectures or upload your class audio with a click of a button.
              </p>
            </div>
            
            {/* Progress bar */}
            {isProcessing && (
              <div className="mb-8">
                <div className="w-full bg-[#21253a]/50 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#ffd600] to-[#4a90e2] transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {/* Upload Controls */}
            <div className="space-y-6 md:space-y-8 mb-8">
              {/* Drag and drop zone */}
              <div className="relative">
                <div className="border-2 border-dashed border-[#ffd600]/30 hover:border-[#ffd600]/60 rounded-2xl p-8 md:p-12 text-center transition-all duration-300 hover:bg-[#ffd600]/5 group">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[#ffd600]/20 flex items-center justify-center group-hover:bg-[#ffd600]/30 transition-colors">
                      <Upload className="w-8 h-8 text-[#ffd600]" />
                    </div>
                    <div>
                      <p className="text-gray-300 text-lg font-medium">
                        Drag and drop your audio file here
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        or click the button below
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Upload and Record buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={handleUpload}
                  className="px-8 py-4 bg-gradient-to-r from-[#ffd600] to-[#4a90e2] text-black font-semibold rounded-xl hover:shadow-2xl hover:transform hover:-translate-y-1 transition-all duration-300 border-2 border-transparent hover:border-[#ffd600]/50 min-w-[200px]"
                  aria-label="Upload audio file"
                >
                  <span className="flex items-center gap-2 justify-center">
                    <Upload className="w-5 h-5" />
                    Upload Audio File
                  </span>
                </button>
                
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="w-8 h-0.5 bg-gray-600"></div>
                  <span className="text-sm">or</span>
                  <div className="w-8 h-0.5 bg-gray-600"></div>
                </div>
                
                <button
                  onClick={handleRecord}
                  className={`px-8 py-4 font-semibold rounded-xl transition-all duration-300 border-2 min-w-[200px] ${
                    isRecording 
                      ? 'bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30' 
                      : 'bg-[#21253a]/80 border-[#4a90e2]/50 text-[#4a90e2] hover:bg-[#4a90e2]/10 hover:border-[#4a90e2]/70'
                  } hover:shadow-xl hover:transform hover:-translate-y-1`}
                  aria-label={isRecording ? "Stop recording" : "Start recording lecture"}
                >
                  <span className="flex items-center gap-2 justify-center">
                    {isRecording ? (
                      <>
                        <div className="flex items-center gap-1">
                          <div className="w-1 h-4 bg-red-400 rounded animate-pulse"></div>
                          <div className="w-1 h-6 bg-red-400 rounded animate-pulse delay-100"></div>
                          <div className="w-1 h-3 bg-red-400 rounded animate-pulse delay-200"></div>
                          <div className="w-1 h-5 bg-red-400 rounded animate-pulse delay-300"></div>
                        </div>
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="w-5 h-5" />
                        Record Lecture
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>
            
            {/* Notes output area */}
            <div className="bg-[#151a2e]/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/5 min-h-[200px] overflow-y-auto max-h-[400px] shadow-inner">
              {showNotes ? (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-[#ffd600] mb-4">Generated Notes</h3>
                  <div className="text-gray-300 space-y-2">
                    <p>• Key concepts from your lecture will appear here</p>
                    <p>• Important definitions and explanations</p>
                    <p>• Summary of main topics discussed</p>
                    <p>• Action items and follow-up questions</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 italic">
                  <p>Your notes will appear here…</p>
                </div>
              )}
            </div>
            
            {/* AudioNotesUploader component */}
            <div className="mt-8">
              <AudioNotesUploader />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      <BottomNav />
      
      {/* Custom animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from { 
            opacity: 0; 
            transform: translateY(1rem); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.7s ease-in-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.7s ease-in-out;
        }
        
        @media (max-width: 640px) {
          .animate-fade-in, .animate-fade-in-up {
            animation-duration: 0.7s;
          }
        }
      `}</style>
    </div>
  );
};

export default AudioNotes;
