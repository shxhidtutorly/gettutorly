
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { SupabaseAuthProvider } from "./contexts/SupabaseAuthContext"; // Removed
// import AuthStateHandler from "./components/auth/AuthStateHandler"; // Removed
import SubscriptionGuard from "./components/auth/SubscriptionGuard";
import Index from "./pages/Index";
// import SignInPage from "./pages/SignIn"; // Removed
// import SignUpPage from "./pages/SignUp"; // Removed
import PricingPage from "./pages/Pricing";
import TutorlyDashboard from "./pages/Dashboard";
import SettingsPage from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    {/* <SupabaseAuthProvider> */} {/* Removed */}
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* <AuthStateHandler> */} {/* Removed */}
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          {/* <Route path="/signin" element={<SignInPage />} /> */} {/* Removed */}
          {/* <Route path="/signup" element={<SignUpPage />} /> */} {/* Removed */}

          {/* Routes that require subscription check */}
          <Route path="/pricing" element={
                <SubscriptionGuard>
                  <PricingPage />
                </SubscriptionGuard>
              } />
              <Route path="/settings" element={
                <SubscriptionGuard>
                  <SettingsPage />
                </SubscriptionGuard>
              } />
              
              {/* Protected routes that require active subscription */}
              <Route path="/dashboard" element={
                <SubscriptionGuard>
                  <TutorlyDashboard />
                </SubscriptionGuard>
              } />
            </Routes>
        {/* </AuthStateHandler> */} {/* Removed */}
        </BrowserRouter>
      </TooltipProvider>
    {/* </SupabaseAuthProvider> */} {/* Removed */}
  </QueryClientProvider>
);

export default App;
