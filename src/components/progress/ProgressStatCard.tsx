
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

export interface ProgressStatCardProps {
  title: string;
  value: number;
  change?: number;
  icon: ReactNode;
  unit?: string;
}

const ProgressStatCard = ({ title, value, change, icon, unit }: ProgressStatCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value}{unit && ` ${unit}`}
        </div>
        {change !== undefined && (
          <p className="text-xs text-muted-foreground">
            {change > 0 ? '+' : ''}{change}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressStatCard;
