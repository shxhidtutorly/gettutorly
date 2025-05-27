
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send } from "lucide-react";
import { callVercelAI } from "@/lib/vercelAiClient";

const VercelAIDemo = () => {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState<'gemini' | 'groq' | 'claude' | 'openrouter' | 'huggingface' | 'together'>('gemini');
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      const result = await callVercelAI(prompt, model);
      setResponse(result);
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
        <CardTitle>Vercel AI API Demo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">AI Model</label>
            <Select value={model} onValueChange={(value: any) => setModel(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select AI model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini">Google Gemini</SelectItem>
                <SelectItem value="groq">Groq</SelectItem>
                <SelectItem value="claude">Anthropic Claude</SelectItem>
                <SelectItem value="openrouter">OpenRouter</SelectItem>
                <SelectItem value="huggingface">Hugging Face</SelectItem>
                <SelectItem value="together">Together.ai</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
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
                Processing with {model}...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send to {model}
              </>
            )}
          </Button>
        </form>
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">Error: {error}</p>
          </div>
        )}
        
        {response && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800 font-medium">Response from {model}:</p>
            <p className="text-sm text-green-700">{response}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VercelAIDemo;
