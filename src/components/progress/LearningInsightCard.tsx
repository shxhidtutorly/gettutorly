
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

export interface LearningInsightCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  description: string;
  bgColorClass?: string;
  iconColorClass?: string;
}

const LearningInsightCard = ({ 
  icon, 
  title, 
  value, 
  description, 
  bgColorClass = "bg-card", 
  iconColorClass = "text-primary" 
}: LearningInsightCardProps) => {
  return (
    <Card className={bgColorClass}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className={iconColorClass}>{icon}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-2">{value}</div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export default LearningInsightCard;
