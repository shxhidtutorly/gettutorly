
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Import pages
import Index from "@/pages/Index";
import About from "@/pages/About";
import FAQ from "@/pages/FAQ";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import Dashboard from "@/pages/Dashboard";
import AINotesGenerator from "@/pages/AINotesGenerator";
import AudioNotes from "@/pages/AudioNotes";
import Flashcards from "@/pages/Flashcards";
import StudyPlans from "@/pages/StudyPlans";
import Progress from "@/pages/Progress";
import AIAssistant from "@/pages/AIAssistant";
import MathChat from "@/pages/MathChat";
import Chat from "@/pages/Chat";
import NotesChat from "@/pages/NotesChat";
import Quiz from "@/pages/Quiz";
import Summaries from "@/pages/Summaries";
import Library from "@/pages/Library";
import Profile from "@/pages/Profile";
import Pricing from "@/pages/Pricing";
import Privacy from "@/pages/Privacy";
import Support from "@/pages/Support";
import StudyTechniques from "@/pages/StudyTechniques";
import MicroLessons from "@/pages/MicroLessons";
import DoubtChain from "@/pages/DoubtChain";
import DoubtBookmarks from "@/pages/DoubtBookmarks";
import TermsOfService from "@/pages/terms-of-service";
import Cancellation from "@/pages/Cancellation";
import NotFound from "@/pages/NotFound";

import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-background">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/support" element={<Support />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/cancellation" element={<Cancellation />} />
                
                {/* Auth routes */}
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                
                {/* Protected routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/ai-notes" element={
                  <ProtectedRoute>
                    <AINotesGenerator />
                  </ProtectedRoute>
                } />
                
                <Route path="/audio-notes" element={
                  <ProtectedRoute>
                    <AudioNotes />
                  </ProtectedRoute>
                } />
                
                <Route path="/flashcards" element={
                  <ProtectedRoute>
                    <Flashcards />
                  </ProtectedRoute>
                } />
                
                <Route path="/study-plans" element={
                  <ProtectedRoute>
                    <StudyPlans />
                  </ProtectedRoute>
                } />
                
                <Route path="/progress" element={
                  <ProtectedRoute>
                    <Progress />
                  </ProtectedRoute>
                } />
                
                <Route path="/ai-assistant" element={
                  <ProtectedRoute>
                    <AIAssistant />
                  </ProtectedRoute>
                } />
                
                <Route path="/math-chat" element={
                  <ProtectedRoute>
                    <MathChat />
                  </ProtectedRoute>
                } />
                
                <Route path="/chat" element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                } />
                
                <Route path="/notes-chat" element={
                  <ProtectedRoute>
                    <NotesChat />
                  </ProtectedRoute>
                } />
                
                <Route path="/quiz" element={
                  <ProtectedRoute>
                    <Quiz />
                  </ProtectedRoute>
                } />
                
                <Route path="/summaries" element={
                  <ProtectedRoute>
                    <Summaries />
                  </ProtectedRoute>
                } />
                
                <Route path="/library" element={
                  <ProtectedRoute>
                    <Library />
                  </ProtectedRoute>
                } />
                
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                
                <Route path="/study-techniques" element={
                  <ProtectedRoute>
                    <StudyTechniques />
                  </ProtectedRoute>
                } />
                
                <Route path="/micro-lessons" element={
                  <ProtectedRoute>
                    <MicroLessons />
                  </ProtectedRoute>
                } />
                
                <Route path="/doubt-chain" element={
                  <ProtectedRoute>
                    <DoubtChain />
                  </ProtectedRoute>
                } />
                
                <Route path="/doubt-bookmarks" element={
                  <ProtectedRoute>
                    <DoubtBookmarks />
                  </ProtectedRoute>
                } />
                
                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
