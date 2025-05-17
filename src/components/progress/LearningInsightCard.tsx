
import { Card, CardContent } from "@/components/ui/card";

interface LearningInsightCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  bgColorClass?: string;
  iconColorClass?: string;
}

export const LearningInsightCard = ({ 
  icon, 
  title, 
  value, 
  description,
  bgColorClass = "bg-spark-light",
  iconColorClass = "text-spark-primary" 
}: LearningInsightCardProps) => (
  <Card className="hover-glow">
    <CardContent className="p-4">
      <div className="flex items-start gap-3">
        <div className={`p-2 ${bgColorClass} rounded-full`}>
          <div className={`h-5 w-5 ${iconColorClass}`}>{icon}</div>
        </div>
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
);
