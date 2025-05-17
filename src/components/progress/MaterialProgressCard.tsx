
import { Book } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MaterialProgressCardProps {
  name: string;
  progress: number;
}

export const MaterialProgressCard = ({ name, progress }: MaterialProgressCardProps) => (
  <Card className="hover-glow">
    <CardContent className="p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${progress >= 75 ? 'bg-green-100' : progress >= 50 ? 'bg-blue-100' : progress >= 25 ? 'bg-yellow-100' : 'bg-red-100'}`}>
            <Book className={`h-5 w-5 ${progress >= 75 ? 'text-green-600' : progress >= 50 ? 'text-blue-600' : progress >= 25 ? 'text-yellow-600' : 'text-red-600'}`} />
          </div>
          <div>
            <p className="font-medium">{name}</p>
            <p className="text-sm text-muted-foreground">
              {progress < 25 ? 'Just started' : 
               progress < 50 ? 'Making progress' : 
               progress < 75 ? 'Well underway' : 
               'Almost complete'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${progress >= 75 ? 'bg-green-500' : progress >= 50 ? 'bg-blue-500' : progress >= 25 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium">{progress}%</span>
        </div>
      </div>
    </CardContent>
  </Card>
);
