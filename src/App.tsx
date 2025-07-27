import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import BookLoader from "@/components/ui/BookLoader";
import NotFoundPage from "@/components/ui/page-not-found";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Pages
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
import faq from "./pages/faq";
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
import MathChat from "./pages/math-chat"; 
import SignInPage from "./pages/SignIn";
import SignUpPage from "./pages/SignUp";
import PricingPage from "./pages/Pricing"; 
import DoubtChain from "./pages/DoubtChain";
import DoubtBookmarks from "./pages/DoubtBookmarks";
import Settings from "./pages/Settings";

// Feature pages (import with unique names)
import MathChatFeature from "./pages/features/math-chat";
import AiNotesFeature from "./pages/features/ai-notes";
import AudioRecapFeature from "./pages/features/audio-recap";
import FlashcardFeature from "./pages/features/flashcard";
import StudyTechniquesFeature from "./pages/features/study-techniques";
import TestsQuizFeature from "./pages/features/tests-quiz";
import SummariesFeature from "./pages/features/summaries";
import DoubtChainFeature from "./pages/features/doubt-chain";
import FeaturesPage from './pages/features'

// CSS
import "./css/animations.css";
import "./css/darkMode.css";
import "./css/mobile.css";

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
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <ErrorBoundary>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/support" element={<Support />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/cancellation" element={<Cancellation />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/faq" element={<faq />} />

                {/* Feature Pages (Public) */}
                <Route path="/features/math-chat" element={<MathChatFeature />} />
                <Route path="/features/ai-notes" element={<AiNotesFeature />} />
                <Route path="/features/audio-recap" element={<AudioRecapFeature />} />
                <Route path="/features/flashcard" element={<FlashcardFeature />} />
                <Route path="/features/study-techniques" element={<StudyTechniquesFeature />} />
                <Route path="/features/tests-quiz" element={<TestsQuizFeature />} />
                <Route path="/features/summaries" element={<SummariesFeature />} />
                <Route path="/features/doubt-chain" element={<DoubtChainFeature />} />
                <Route path="/features" element={<FeaturesPage />} />


                {/* Protected Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/home" element={<Navigate to="/dashboard" replace />} />
                <Route path="/landing" element={<Index />} />

                <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
                <Route path="/ai-notes" element={<ProtectedRoute><AINotesGenerator /></ProtectedRoute>} />
                <Route path="/audio-notes" element={<ProtectedRoute><AudioNotes /></ProtectedRoute>} />
                <Route path="/math-chat" element={<ProtectedRoute><MathChat /></ProtectedRoute>} />
                <Route path="/study-plans" element={<ProtectedRoute><StudyPlans /></ProtectedRoute>} />
                <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
                <Route path="/flashcards" element={<ProtectedRoute><Flashcards /></ProtectedRoute>} />
                <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
                <Route path="/summaries" element={<ProtectedRoute><Summaries /></ProtectedRoute>} />
                <Route path="/micro-lessons" element={<ProtectedRoute><MicroLessons /></ProtectedRoute>} />
                <Route path="/study-techniques" element={<ProtectedRoute><StudyTechniques /></ProtectedRoute>} />
                <Route path="/doubt-chain" element={<ProtectedRoute><DoubtChain /></ProtectedRoute>} />
                <Route path="/doubt-bookmarks" element={<ProtectedRoute><DoubtBookmarks /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/upload" element={<Navigate to="/ai-notes" replace />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
