
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { callVercelAI } from "@/lib/vercelAiClient";

const SimpleAIDemo = () => {
  const [prompt, setPrompt] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }
    
    console.log("Sending request", prompt, "gemini");
    
    setIsLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      const result = await callVercelAI(prompt, 'gemini');
      setMessage(result);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : "Failed to get response");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>AI Vercel API Demo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="What is cloud computing?"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
          />
          
          <Button 
            type="submit" 
            disabled={isLoading || !prompt.trim()} 
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Send to Vercel API"
            )}
          </Button>
        </form>
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">Error: {error}</p>
          </div>
        )}
        
        {message && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800 font-medium">Response:</p>
            <p className="text-sm text-green-700">{message}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SimpleAIDemo;
