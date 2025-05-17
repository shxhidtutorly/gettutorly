
import { ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ProgressStatCardProps {
  title: string;
  value: number;
  unit?: string;
  change: number;
  icon: React.ReactNode;
}

export const ProgressStatCard = ({ title, value, unit = "", change, icon }: ProgressStatCardProps) => (
  <Card className="hover-glow">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold">
            {value} {unit && <span className="text-base font-normal">{unit}</span>}
          </p>
          {change !== 0 && (
            <div className={`flex items-center text-xs ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? (
                <ArrowUp className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDown className="h-3 w-3 mr-1" />
              )}
              <span>{Math.abs(change)} {unit}</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-spark-light rounded-full">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);
