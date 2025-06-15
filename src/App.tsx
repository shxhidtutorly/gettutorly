
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SupabaseAuthProvider } from "@/contexts/SupabaseAuthContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import FuturisticDashboard from "./pages/FuturisticDashboard";
import NewDashboard from "./pages/NewDashboard";
import TutorlyDashboard from "./pages/TutorlyDashboard";
import Chat from "./pages/Chat";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import AIAssistant from "./pages/AIAssistant";
import Flashcards from "./pages/Flashcards";
import Quiz from "./pages/Quiz";
import Summaries from "./pages/Summaries";
import StudyTechniques from "./pages/StudyTechniques";
import StudyPlans from "./pages/StudyPlans";
import Progress from "./pages/Progress";
import MathChat from "./pages/MathChat";
import AudioNotes from "./pages/AudioNotes";
import Library from "./pages/Library";
import DoubtChain from "./pages/DoubtChain";
import Pricing from "./pages/Pricing";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseAuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/dashboard" element={<FuturisticDashboard />} />
              <Route path="/old-dashboard" element={<Dashboard />} />
              <Route path="/new-dashboard" element={<NewDashboard />} />
              <Route path="/tutorly-dashboard" element={<TutorlyDashboard />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/ai-assistant" element={<AIAssistant />} />
              <Route path="/flashcards" element={<Flashcards />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/summaries" element={<Summaries />} />
              <Route path="/study-techniques" element={<StudyTechniques />} />
              <Route path="/study-plans" element={<StudyPlans />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/math-chat" element={<MathChat />} />
              {/* Remove AINotes route */}
              <Route path="/audio-notes" element={<AudioNotes />} />
              <Route path="/library" element={<Library />} />
              <Route path="/doubt-chain" element={<DoubtChain />} />
              <Route path="/pricing" element={<Pricing />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SupabaseAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
