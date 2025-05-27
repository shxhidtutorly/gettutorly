
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { testVercelAPI, callVercelAI } from "@/lib/vercelAiClient";

const APITester = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTestConnectivity = async () => {
    setIsLoading(true);
    setTestResult('Testing...');
    
    try {
      const result = await testVercelAPI();
      setTestResult(result ? '✅ API connectivity test passed!' : '❌ API connectivity test failed');
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestAI = async () => {
    setIsLoading(true);
    setTestResult('Testing AI...');
    
    try {
      const result = await callVercelAI('Say hello!', 'gemini');
      setTestResult(`✅ AI test passed! Response: ${result}`);
    } catch (error) {
      setTestResult(`❌ AI test failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>API Connection Tester</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button 
            onClick={handleTestConnectivity} 
            disabled={isLoading}
            className="w-full"
          >
            Test Basic Connectivity
          </Button>
          
          <Button 
            onClick={handleTestAI} 
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            Test AI Response
          </Button>
        </div>
        
        {testResult && (
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm">{testResult}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default APITester;
