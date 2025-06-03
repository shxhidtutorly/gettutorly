
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate
} from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Landing from "./pages/Landing";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Library from "./pages/Library";
import AINotes from "./pages/AINotes";
import Summaries from "./pages/Summaries";
import Flashcards from "./pages/Flashcards";
import Quiz from "./pages/Quiz";
import StudyPlans from "./pages/StudyPlans";
import AIAssistant from "./pages/AIAssistant";
import Progress from "./pages/Progress";
import { Toaster } from "@/components/ui/toaster"
import SnapSolve from "@/pages/SnapSolve";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/signin" />;
  }
  return children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <div className="min-h-screen bg-background text-foreground">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/landing" element={<Landing />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
                <Route path="/ai-notes" element={<ProtectedRoute><AINotes /></ProtectedRoute>} />
                <Route path="/summaries" element={<ProtectedRoute><Summaries /></ProtectedRoute>} />
                <Route path="/flashcards" element={<ProtectedRoute><Flashcards /></ProtectedRoute>} />
                <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
                <Route path="/study-plans" element={<ProtectedRoute><StudyPlans /></ProtectedRoute>} />
                <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
                <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
                <Route path="/snap-solve" element={<ProtectedRoute><SnapSolve /></ProtectedRoute>} />
              </Routes>
              <Toaster />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
