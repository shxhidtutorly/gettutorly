
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText } from "lucide-react";
import { getRemainingUsage, getSessionTimeRemaining, formatTimeRemaining } from "@/utils/summaryLimits";
import { useEffect, useState } from "react";

export const SummaryUsageTracker = () => {
  const [remaining, setRemaining] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    const updateUsage = () => {
      setRemaining(getRemainingUsage());
      setTimeRemaining(getSessionTimeRemaining());
    };

    updateUsage();
    const interval = setInterval(updateUsage, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const usedSummaries = 3 - remaining;
  const progressPercentage = (usedSummaries / 3) * 100;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5" />
          Summary Usage
        </CardTitle>
        <CardDescription>
          Track your daily summary usage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Used Today</span>
            <Badge variant={remaining > 0 ? "default" : "destructive"}>
              {usedSummaries} / 3
            </Badge>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Resets in
          </div>
          <span className="text-sm font-medium">
            {formatTimeRemaining(timeRemaining)}
          </span>
        </div>
        
        {remaining === 0 && (
          <div className="text-center text-sm text-muted-foreground bg-muted p-3 rounded-md">
            You've reached your daily limit. Upgrade for unlimited summaries!
          </div>
        )}
      </CardContent>
    </Card>
  );
};
