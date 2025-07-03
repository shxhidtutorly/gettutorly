import { Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { webglManager } from "@/lib/webgl-manager";
import { firebaseSecure } from "@/lib/firebase-secure";

import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import MathChat from "@/pages/math-chat";
import Flashcards from "@/pages/Flashcards";
import TutorlyDashboard from "@/pages/TutorlyDashboard";
// Import other pages as needed

function App() {
  useEffect(() => {
    // Initialize Firebase security service
    console.log("Tutorly app initialized with Firebase security");
    
    // Setup global error handling
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
    });

    // Cleanup on unmount
    return () => {
      webglManager.disposeAll();
    };
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-background font-sans antialiased">
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/math-chat" element={
              <ProtectedRoute>
                <MathChat />
              </ProtectedRoute>
            } />
            <Route path="/flashcards" element={
              <ProtectedRoute>
                <Flashcards />
              </ProtectedRoute>
            } />
            <Route path="/tutorly-dashboard" element={
              <ProtectedRoute>
                <TutorlyDashboard />
              </ProtectedRoute>
            } />
            {/* Add other routes here with ProtectedRoute as needed */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
