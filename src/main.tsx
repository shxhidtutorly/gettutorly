
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import App from "./App.tsx";
import "./index.css";

const queryClient = new QueryClient();

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// If no Clerk key is provided, show a helpful setup message
if (!publishableKey) {
  const SetupMessage = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-8">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-bold">🔑 Setup Required</h1>
        <div className="bg-gray-800 p-6 rounded-lg text-left">
          <h2 className="text-xl font-semibold mb-4">Missing Clerk Configuration</h2>
          <p className="mb-4">To use this application, you need to set up Clerk authentication:</p>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Visit <a href="https://dashboard.clerk.com/last-active?path=api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Clerk Dashboard</a></li>
            <li>Create a new application or select an existing one</li>
            <li>Copy your Publishable Key from the API Keys section</li>
            <li>Add it as <code className="bg-gray-700 px-2 py-1 rounded">VITE_CLERK_PUBLISHABLE_KEY</code> in your environment variables</li>
          </ol>
          <div className="mt-4 p-3 bg-gray-700 rounded">
            <p className="text-xs text-gray-300">Environment variable format:</p>
            <code className="text-green-400">VITE_CLERK_PUBLISHABLE_KEY=pk_test_...</code>
          </div>
        </div>
        <p className="text-gray-400">Once configured, refresh the page to continue.</p>
      </div>
    </div>
  );

  createRoot(document.getElementById("root")!).render(<SetupMessage />);
} else {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <ClerkProvider 
        publishableKey={publishableKey}
        signInFallbackRedirectUrl="/dashboard"
        signUpFallbackRedirectUrl="/dashboard"
      >
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>
              <App />
              <Toaster />
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </ClerkProvider>
    </StrictMode>,
  );
}
