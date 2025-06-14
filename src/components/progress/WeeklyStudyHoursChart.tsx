
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

export interface WeeklyStudyHoursChartProps {
  data: { day: string; hours: number }[];
  isLoading: boolean;
  className?: string;
}

const WeeklyStudyHoursChart: React.FC<WeeklyStudyHoursChartProps> = ({
  data,
  isLoading,
  className = ''
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Weekly Study Hours</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <XAxis dataKey="day" />
            <YAxis />
            <Bar dataKey="hours" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default WeeklyStudyHoursChart;
