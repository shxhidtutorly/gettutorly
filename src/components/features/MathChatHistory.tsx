
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, Calendar } from "lucide-react";
import MathRenderer from "./MathRenderer";

interface MathChatHistoryItem {
  id: string;
  problem: string;
  solution: string;
  timestamp: Date;
}

const MathChatHistory = () => {
  const [history, setHistory] = useState<MathChatHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    // Load history from localStorage for now
    const savedHistory = localStorage.getItem('math_chat_history');
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory);
      setHistory(parsed.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      })));
    }
  }, []);

  if (!showHistory || history.length === 0) {
    return (
      <Card className="mt-6">
        <CardContent className="p-4">
          <Button
            variant="outline"
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center gap-2"
          >
            <History className="h-4 w-4" />
            {history.length > 0 ? `View History (${history.length} problems)` : 'No history yet'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="h-5 w-5" />
          Math Problem History
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowHistory(false)}
        >
          Hide
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {history.slice(0, 5).map((item) => (
          <div key={item.id} className="border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {item.timestamp.toLocaleDateString()}
            </div>
            
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium">Problem: </span>
                <MathRenderer content={item.problem} />
              </div>
              
              <div>
                <span className="text-sm font-medium">Solution: </span>
                <MathRenderer content={item.solution} />
              </div>
            </div>
          </div>
        ))}
        
        {history.length > 5 && (
          <p className="text-sm text-muted-foreground text-center">
            And {history.length - 5} more problems...
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default MathChatHistory;
