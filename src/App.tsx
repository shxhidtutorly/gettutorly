import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";

import AuthStateHandler from "./components/auth/AuthStateHandler";
import SubscriptionGuard from "./components/auth/SubscriptionGuard";

import Index from "./pages/Index";
import SignInPage from "./pages/SignIn";
import SignUpPage from "./pages/SignUp";
import PricingPage from "./pages/Pricing";
import TutorlyDashboard from "./pages/Dashboard";
import SettingsPage from "./pages/Settings";

// No longer using SupabaseAuthProvider
const queryClient = new QueryClient();
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!clerkPubKey) throw new Error("Missing Clerk publishable key");


const App = () => (
  <ClerkProvider publishableKey={clerkPubKey}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthStateHandler>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/signup" element={<SignUpPage />} />

              {/* Routes that require subscription check */}
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

              {/* Protected route */}
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
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ClerkProvider>
);

export default App;
