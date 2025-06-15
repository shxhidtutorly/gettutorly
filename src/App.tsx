
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SupabaseAuthProvider } from "@/contexts/SupabaseAuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AuthStateHandler from "@/components/auth/AuthStateHandler";

// Lazy load components
const Index = lazy(() => import("@/pages/Index"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const TutorlyDashboard = lazy(() => import("@/pages/TutorlyDashboard"));
const SignIn = lazy(() => import("@/pages/SignIn"));
const SignUp = lazy(() => import("@/pages/SignUp"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const PaymentSuccess = lazy(() => import("@/pages/PaymentSuccess"));
const PaymentCancel = lazy(() => import("@/pages/PaymentCancel"));

// Lazy load other components - using correct file names
const Summaries = lazy(() => import("@/pages/Summaries"));
const Library = lazy(() => import("@/pages/Library"));
const Flashcards = lazy(() => import("@/pages/Flashcards"));
const Quiz = lazy(() => import("@/pages/Quiz"));
const Progress = lazy(() => import("@/pages/Progress"));
const AINotesGenerator = lazy(() => import("@/pages/AINotesGenerator"));
const DoubtChain = lazy(() => import("@/pages/DoubtChain"));
const AIAssistant = lazy(() => import("@/pages/AIAssistant"));
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
              <AuthStateHandler>
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    {/* Public routes - accessible to everyone */}
                    <Route path="/" element={<Index />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/success" element={<PaymentSuccess />} />
                    <Route path="/cancel" element={<PaymentCancel />} />
                    
                    {/* Protected routes - require authentication */}
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
                          <Flashcards />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/quiz"
                      element={
                        <ProtectedRoute>
                          <Quiz />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/progress"
                      element={
                        <ProtectedRoute>
                          <Progress />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/ai-notes-generator"
                      element={
                        <ProtectedRoute>
                          <AINotesGenerator />
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
                          <AIAssistant />
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
              </AuthStateHandler>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </SupabaseAuthProvider>
    </QueryClientProvider>
  );
};

export default App;
