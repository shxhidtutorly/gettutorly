
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Library from "./pages/Library";
import StudyPlans from "./pages/StudyPlans";
import Progress from "./pages/Progress";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Chat from "./pages/Chat";
import Flashcards from "./pages/Flashcards";
import Quiz from "./pages/Quiz";
import Summaries from "./pages/Summaries";
import MicroLessons from "./pages/MicroLessons";
import AIAssistant from "./pages/AIAssistant";
import StudyTechniques from "./pages/StudyTechniques";
import TermsOfService from "./pages/terms-of-service";
import Support from "./pages/Support";
import Cancellation from "./pages/Cancellation";
import Privacy from "./pages/Privacy";
import AINotesGenerator from "./pages/AINotesGenerator";
import AudioNotes from "./pages/AudioNotes";
import MathChat from "@/pages/math-chat"; 
import SignInPage from "./pages/SignIn";
import SignUpPage from "./pages/SignUp";
import PricingPage from "./pages/Pricing"; 
import DoubtChain from "./pages/DoubtChain";
import DoubtBookmarks from "./pages/DoubtBookmarks";
import Settings from "./pages/Settings";

import "./css/animations.css";
import "./css/darkMode.css";
import "./css/mobile.css";

import SubscriptionGuard from "./components/auth/SubscriptionGuard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/support" element={<Support />} />
            <Route path="/cancellation" element={<Cancellation />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/pricing" element={<PricingPage />} />

            {/* Protected routes - all wrapped with ProtectedRoute and SubscriptionGuard */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <SubscriptionGuard>
                  <Dashboard />
                </SubscriptionGuard>
              </ProtectedRoute>
            } />
            
            <Route path="/home" element={<Navigate to="/dashboard" replace />} />
            <Route path="/landing" element={<Index />} />

            <Route path="/library" element={
              <ProtectedRoute>
                <SubscriptionGuard>
                  <Library />
                </SubscriptionGuard>
              </ProtectedRoute>
            } />
            
            <Route path="/ai-notes" element={
              <ProtectedRoute>
                <SubscriptionGuard>
                  <AINotesGenerator />
                </SubscriptionGuard>
              </ProtectedRoute>
            } />
            
            <Route path="/audio-notes" element={
              <ProtectedRoute>
                <SubscriptionGuard>
                  <AudioNotes />
                </SubscriptionGuard>
              </ProtectedRoute>
            } />
            
            <Route path="/math-chat" element={
              <ProtectedRoute>
                <SubscriptionGuard>
                  <MathChat />
                </SubscriptionGuard>
              </ProtectedRoute>
            } />
            
            <Route path="/study-plans" element={
              <ProtectedRoute>
                <SubscriptionGuard>
                  <StudyPlans />
                </SubscriptionGuard>
              </ProtectedRoute>
            } />
            
            <Route path="/progress" element={
              <ProtectedRoute>
                <SubscriptionGuard>
                  <Progress />
                </SubscriptionGuard>
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <SubscriptionGuard>
                  <Profile />
                </SubscriptionGuard>
              </ProtectedRoute>
            } />
            
            <Route path="/chat" element={
              <ProtectedRoute>
                <SubscriptionGuard>
                  <Chat />
                </SubscriptionGuard>
              </ProtectedRoute>
            } />
            
            <Route path="/ai-assistant" element={
              <ProtectedRoute>
                <SubscriptionGuard>
                  <AIAssistant />
                </SubscriptionGuard>
              </ProtectedRoute>
            } />
            
            <Route path="/flashcards" element={
              <ProtectedRoute>
                <SubscriptionGuard>
                  <Flashcards />
                </SubscriptionGuard>
              </ProtectedRoute>
            } />
            
            <Route path="/quiz" element={
              <ProtectedRoute>
                <SubscriptionGuard>
                  <Quiz />
                </SubscriptionGuard>
              </ProtectedRoute>
            } />
            
            <Route path="/summaries" element={
              <ProtectedRoute>
                <SubscriptionGuard>
                  <Summaries />
                </SubscriptionGuard>
              </ProtectedRoute>
            } />
            
            <Route path="/micro-lessons" element={
              <ProtectedRoute>
                <SubscriptionGuard>
                  <MicroLessons />
                </SubscriptionGuard>
              </ProtectedRoute>
            } />
            
            <Route path="/study-techniques" element={
              <ProtectedRoute>
                <SubscriptionGuard>
                  <StudyTechniques />
                </SubscriptionGuard>
              </ProtectedRoute>
            } />
            
            <Route path="/doubt-chain" element={
              <ProtectedRoute>
                <SubscriptionGuard>
                  <DoubtChain />
                </SubscriptionGuard>
              </ProtectedRoute>
            } />
            
            <Route path="/doubt-bookmarks" element={
              <ProtectedRoute>
                <SubscriptionGuard>
                  <DoubtBookmarks />
                </SubscriptionGuard>
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <SubscriptionGuard>
                  <Settings />
                </SubscriptionGuard>
              </ProtectedRoute>
            } />
            
            <Route path="/upload" element={<Navigate to="/ai-notes" replace />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
