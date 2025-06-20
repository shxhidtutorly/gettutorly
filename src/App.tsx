import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ClerkProvider, RedirectToSignIn } from "@clerk/clerk-react";
import { useUser } from "@clerk/clerk-react";

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
import MathChat from "./pages/MathChat";
import SignInPage from "./pages/SignIn";
import SignUpPage from "./pages/SignUp";
import DoubtChain from "./pages/DoubtChain";
import DoubtBookmarks from "./pages/DoubtBookmarks";

import "./css/animations.css";
import "./css/darkMode.css";
import "./css/mobile.css";

import SubscriptionGuard from "./components/auth/SubscriptionGuard";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protect routes for signed-in + subscribed users
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isSignedIn } = useUser();

  if (!isSignedIn) return <RedirectToSignIn />;
  return <SubscriptionGuard>{children}</SubscriptionGuard>;
};

const App = () => (
  <ClerkProvider publishableKey={clerkPubKey}>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/signup" element={<SignUpPage />} />

              {/* Auth + Subscription Protected */}
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

              <Route path="/upload" element={<Navigate to="/ai-notes" replace />} />

              {/* Public pages */}
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/support" element={<Support />} />
              <Route path="/cancellation" element={<Cancellation />} />
              <Route path="/privacy" element={<Privacy />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ClerkProvider>
);

export default App;
