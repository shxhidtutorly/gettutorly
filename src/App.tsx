import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SupabaseAuthProvider } from "@/contexts/SupabaseAuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Lazy load components
const Index = lazy(() => import("@/pages/Index"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const TutorlyDashboard = lazy(() => import("@/pages/TutorlyDashboard"));
const SignIn = lazy(() => import("@/pages/SignIn"));
const SignUp = lazy(() => import("@/pages/SignUp"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const PaymentSuccess = lazy(() => import("@/pages/PaymentSuccess"));
const PaymentCancel = lazy(() => import("@/pages/PaymentCancel"));

// Lazy load other components
const Summaries = lazy(() => import("@/pages/Summaries"));
const Library = lazy(() => import("@/pages/Library"));
const FlashcardsPage = lazy(() => import("@/pages/FlashcardsPage"));
const QuizPage = lazy(() => import("@/pages/QuizPage"));
const ProgressPage = lazy(() => import("@/pages/ProgressPage"));
const AiNotesGenerator = lazy(() => import("@/pages/AiNotesGenerator"));
const DoubtChain = lazy(() => import("@/pages/DoubtChain"));
const AiAssistant = lazy(() => import("@/pages/AiAssistant"));
const MathChat = lazy(() => import("@/pages/MathChat"));
const AudioNotes = lazy(() => import("@/pages/AudioNotes"));
const StudyPlans = lazy(() => import("@/pages/StudyPlans"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
  </div>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseAuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/success" element={<PaymentSuccess />} />
                  <Route path="/cancel" element={<PaymentCancel />} />
                  
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/tutorly-dashboard"
                    element={
                      <ProtectedRoute>
                        <TutorlyDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Protected routes */}
                  <Route
                    path="/summaries"
                    element={
                      <ProtectedRoute>
                        <Summaries />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/library"
                    element={
                      <ProtectedRoute>
                        <Library />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/flashcards"
                    element={
                      <ProtectedRoute>
                        <FlashcardsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/quiz"
                    element={
                      <ProtectedRoute>
                        <QuizPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/progress"
                    element={
                      <ProtectedRoute>
                        <ProgressPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/ai-notes-generator"
                    element={
                      <ProtectedRoute>
                        <AiNotesGenerator />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/doubt-chain"
                    element={
                      <ProtectedRoute>
                        <DoubtChain />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/ai-assistant"
                    element={
                      <ProtectedRoute>
                        <AiAssistant />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/math-chat"
                    element={
                      <ProtectedRoute>
                        <MathChat />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/audio-notes"
                    element={
                      <ProtectedRoute>
                        <AudioNotes />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/study-plans"
                    element={
                      <ProtectedRoute>
                        <StudyPlans />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </SupabaseAuthProvider>
    </QueryClientProvider>
  );
};

export default App;
