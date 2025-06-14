
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export interface MaterialProgressCardProps {
  name: string;
  progress: number;
  className?: string;
}

const MaterialProgressCard: React.FC<MaterialProgressCardProps> = ({
  name,
  progress,
  className = ''
}) => {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">{name}</h3>
          <span className="text-sm text-muted-foreground">{progress}%</span>
        </div>
        <Progress value={progress} className="w-full" />
      </CardContent>
    </Card>
  );
};

export default MaterialProgressCard;
