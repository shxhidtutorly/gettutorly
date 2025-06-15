
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import AITutor from "@/components/features/AITutor";
import { Button } from "@/components/ui/button";
import { MessageSquare, Maximize2 } from "lucide-react";

const Chat = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#0d1117] text-white">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-6xl mx-auto">
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                  <MessageSquare className="h-7 w-7 text-spark-primary" />
                  AI Tutor Chat
                </h1>
                <p className="text-muted-foreground">Get instant help with your studies</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="animated-button"
              >
                <Maximize2 className="h-4 w-4 mr-2" />
                {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </Button>
            </div>
          </div>
          
          <div className={`${isFullscreen ? 'fixed inset-4 z-50' : 'h-[600px]'} transition-all duration-300`}>
            <AITutor 
              isFullscreen={isFullscreen}
              theme="default"
              className="h-full dark:bg-card dark:border-muted"
            />
          </div>
        </div>
      </main>
      
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Chat;
