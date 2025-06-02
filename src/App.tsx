import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
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
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback";
import TermsOfService from "./pages/terms-of-service";
import Support from "./pages/Support";
import Cancellation from "./pages/Cancellation";
import Privacy from "./pages/Privacy";
import "./css/animations.css";
import "./css/darkMode.css";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// 👇 ADD THESE IMPORTS
import FileUploader from "./components/FileUploader";
import NotesPage from "./components/NotesPage";
// Create a new QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

document.title = "Tutorly - Smart Learning Platform";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            {/* 👇 OPTIONAL: Add navigation bar to match your snippet */}
            <header className="p-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold">AI Notes + Flashcards</h1>
              <nav>
                <Link to="/" className="px-2 hover:underline">Home</Link>
                <Link to="/notes" className="px-2 hover:underline">Notes</Link>
                <Link to="/flashcards" className="px-2 hover:underline">Flashcards</Link>
              </nav>
            </header>
            <main className="max-w-2xl mx-auto p-4">
              <Routes>
                {/* Existing routes */}
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/home" element={<Navigate to="/dashboard" replace />} />
                <Route path="/landing" element={<Index />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/library" element={
                  <ProtectedRoute>
                    <Library />
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
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/chat" element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                } />
                <Route path="/ai-assistant" element={
                  <ProtectedRoute>
                    <AIAssistant />
                  </ProtectedRoute>
                } />
                <Route path="/flashcards" element={
                  <ProtectedRoute>
                    <Flashcards />
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
                <Route path="/micro-lessons" element={
                  <ProtectedRoute>
                    <MicroLessons />
                  </ProtectedRoute>
                } />
                <Route path="/study-techniques" element={
                  <ProtectedRoute>
                    <StudyTechniques />
                  </ProtectedRoute>
                } />
                <Route path="/upload" element={<Navigate to="/library" replace />} />

                {/* ✅ Terms of Service Route */}
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/support" element={<Support />} />
                <Route path="/cancellation" element={<Cancellation />} />
                <Route path="/Privacy" element={<Privacy />} />

                {/* 👇 NEW ROUTES */}
                <Route path="/ainotes" element={<FileUploader />} />
                <Route path="/notes" element={<NotesPage />} />
                <Route path="/flashcards" element={<FlashcardsPage />} />

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Toaster />
            <Sonner />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
