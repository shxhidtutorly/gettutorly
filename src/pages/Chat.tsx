
import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import AITutor from "@/components/features/AITutor";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Chat = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate("/dashboard");
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-6xl mx-auto">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBack}
              className="mr-4 hover:bg-spark-light"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold">AI Study Tutor</h1>
          </div>
          <p className="text-muted-foreground mb-8">
            Chat with your AI tutor about any topic in your study materials
          </p>
          
          <div className={`${isFullscreen ? 'fixed inset-0 z-50 p-4 pb-20 md:pb-4 bg-white dark:bg-background' : ''}`}>
            {isFullscreen && (
              <div className="flex items-center mb-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleBack}
                  className="mr-4 hover:bg-spark-light"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
                </Button>
                <h2 className="text-xl font-medium">AI Study Tutor</h2>
              </div>
            )}
            <AITutor 
              isFullscreen={isFullscreen} 
              toggleFullscreen={toggleFullscreen}
              onClose={handleCloseFullscreen}
            />
          </div>
        </div>
      </main>
      
      {!isFullscreen && (
        <>
          <Footer />
          <BottomNav />
        </>
      )}
    </div>
  );
};

export default Chat;
