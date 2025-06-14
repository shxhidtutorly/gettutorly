
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export interface LearningInsightCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  bgColorClass?: string;
  iconColorClass?: string;
  className?: string;
}

const LearningInsightCard: React.FC<LearningInsightCardProps> = ({
  icon,
  title,
  value,
  description,
  bgColorClass = '',
  iconColorClass = '',
  className = ''
}) => {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${bgColorClass}`}>
            <div className={iconColorClass}>{icon}</div>
          </div>
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LearningInsightCard;
