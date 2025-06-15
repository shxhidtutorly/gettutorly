
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { testSupabaseConnection } from '@/lib/database';

const SupabaseDebugger = () => {
  const [testUserId, setTestUserId] = useState('user_2yGzF0sPL4RMDWXyjYBkZLrAz2J');
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const runTests = async () => {
    if (!testUserId) {
      toast({
        title: "Error",
        description: "Please enter a Clerk User ID",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      console.log('🧪 Starting Supabase debug tests...');
      const testResults = await testSupabaseConnection(testUserId);
      setResults(testResults);
      
      toast({
        title: "Debug Tests Complete",
        description: "Check the console and results below for details"
      });
    } catch (error) {
      console.error('❌ Debug tests failed:', error);
      toast({
        title: "Tests Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const ResultCard = ({ title, result }: { title: string, result: any }) => (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xs space-y-2">
          <div>
            <strong>Data:</strong>
            <pre className="bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-32">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
          <div>
            <strong>Error:</strong>
            <pre className="bg-red-50 p-2 rounded mt-1 overflow-auto max-h-32">
              {result.error ? JSON.stringify(result.error, null, 2) : 'No error'}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>🔧 Supabase Integration Debugger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Input
            placeholder="Enter Clerk User ID (e.g., user_2yGzF0sPL4RMDWXyjYBkZLrAz2J)"
            value={testUserId}
            onChange={(e) => setTestUserId(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={runTests} 
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? '🔄 Testing...' : '🧪 Run Tests'}
          </Button>
        </div>

        <div className="text-sm text-gray-600">
          This will test the following queries:
          <ul className="list-disc ml-6 mt-2">
            <li><code>study_progress.select('time_spent').eq('clerk_user_id', userId)</code></li>
            <li><code>user_activity_logs.select('*').eq('clerk_user_id', userId)</code></li>
            <li><code>notes.select('*').eq('clerk_user_id', userId)</code></li>
          </ul>
        </div>

        {results && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Test Results:</h3>
            <ResultCard title="📊 Study Progress Query" result={results.progress} />
            <ResultCard title="📝 Activity Logs Query" result={results.activity} />
            <ResultCard title="📓 Notes Query" result={results.notes} />
          </div>
        )}

        <div className="text-xs text-gray-500 mt-4">
          💡 Open your browser's Developer Console (F12) to see detailed logs of all API calls and auth tokens.
        </div>
      </CardContent>
    </Card>
  );
};

export default SupabaseDebugger;
