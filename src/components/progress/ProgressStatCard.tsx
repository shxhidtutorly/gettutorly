
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export interface ProgressStatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: number;
  icon: React.ReactNode;
  className?: string;
  color?: string;
}

const ProgressStatCard: React.FC<ProgressStatCardProps> = ({
  title,
  value,
  unit,
  change,
  icon,
  className = '',
  color
}) => {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-center gap-1">
              <p className="text-2xl font-bold">{value}</p>
              {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
            </div>
            {change !== undefined && (
              <p className={`text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? '+' : ''}{change}% from last week
              </p>
            )}
          </div>
          <div className="text-2xl">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressStatCard;
