import { useEffect, useState } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import AuthStateHandler from "./components/auth/AuthStateHandler";
import SubscriptionGuard from "./components/auth/SubscriptionGuard";

import Index from "./pages/Index";
import SignInPage from "./pages/SignIn";
import SignUpPage from "./pages/SignUp";
import PricingPage from "./pages/Pricing";
import TutorlyDashboard from "./pages/Dashboard";
import SettingsPage from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true); // Avoid rendering before router is ready
  }, []);

  if (!ready) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthStateHandler>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />

            {/* Subscription protected routes */}
            <Route
              path="/pricing"
              element={
                <SubscriptionGuard>
                  <PricingPage />
                </SubscriptionGuard>
              }
            />
            <Route
              path="/settings"
              element={
                <SubscriptionGuard>
                  <SettingsPage />
                </SubscriptionGuard>
              }
            />

            {/* Auth protected route */}
            <Route
              path="/dashboard"
              element={
                <SubscriptionGuard>
                  <TutorlyDashboard />
                </SubscriptionGuard>
              }
            />
          </Routes>
        </AuthStateHandler>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
