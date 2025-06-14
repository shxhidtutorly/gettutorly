
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

export interface MonthlyProgressChartProps {
  data: { name: string; hours: number }[];
  isLoading: boolean;
  className?: string;
}

const MonthlyProgressChart: React.FC<MonthlyProgressChartProps> = ({
  data,
  isLoading,
  className = ''
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Monthly Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Line type="monotone" dataKey="hours" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default MonthlyProgressChart;
