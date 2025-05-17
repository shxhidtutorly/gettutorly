
import { BarChart as BarChartIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, ResponsiveContainer, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface WeeklyStudyHoursChartProps {
  data: { day: string; hours: number }[];
  isLoading: boolean;
}

export const WeeklyStudyHoursChart = ({ data, isLoading }: WeeklyStudyHoursChartProps) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-lg flex items-center gap-2">
        <BarChartIcon className="h-5 w-5 text-spark-primary" />
        Weekly Study Hours
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-0">
      {isLoading ? (
        <div className="animate-pulse h-64 bg-gray-200 rounded-lg"></div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value} hrs`, 'Study Time']} 
                labelFormatter={(label) => `${label}`}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="hours" fill="#9b87f5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </CardContent>
  </Card>
);
