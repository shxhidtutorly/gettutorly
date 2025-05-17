
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, ResponsiveContainer, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface MonthlyProgressChartProps {
  data: { name: string; hours: number }[];
  isLoading: boolean;
}

export const MonthlyProgressChart = ({ data, isLoading }: MonthlyProgressChartProps) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-lg flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-spark-primary" />
        Monthly Learning Progress
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-0">
      {isLoading ? (
        <div className="animate-pulse h-64 bg-gray-200 rounded-lg"></div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value} hrs`, 'Total Hours']} 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey="hours" 
                stroke="#9b87f5" 
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </CardContent>
  </Card>
);
