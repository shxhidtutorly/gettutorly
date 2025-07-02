
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";

const NotesChat = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-white">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 pb-20 md:pb-8">
        <div className="container max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <MessageCircle className="h-8 w-8 text-purple-400" />
              Notes Chat
            </h1>
            <p className="text-gray-400">Chat with your notes using AI</p>
          </div>

          <Card className="bg-[#121212] border-slate-700">
            <CardHeader>
              <CardTitle>Chat Feature</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                This feature has been integrated into the AI Notes Generator. 
                Please use the chat functionality available in the Notes tab after generating your notes.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default NotesChat;
