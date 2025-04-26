// src/pages/adminUI/components/PostsManagement/GoldenHoursChart.tsx

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Loader2 } from 'lucide-react';

interface HourData {
  hour: number;
  hourFormatted: string;
  posts: number;
  likes: number;
  comments: number;
  engagement: number | string;
}

interface GoldenHoursChartProps {
  data: HourData[];
  isLoading: boolean;
}

const GoldenHoursChart: React.FC<GoldenHoursChartProps> = ({
  data,
  isLoading,
}) => {
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md shadow-md p-3">
          <p className="font-medium">{label}</p>
          <div className="mt-2 space-y-1">
            <p className="text-sm">Posts: {payload[0].payload.posts}</p>
            <p className="text-[#8884d8] text-sm">Engagement: {payload[0].value}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Find hour with highest engagement
  const findBestHour = () => {
    if (!data || data.length === 0) return null;
    
    return data.reduce((best, current) => {
      const bestEngagement = typeof best.engagement === 'string' ? parseFloat(best.engagement) : best.engagement;
      const currentEngagement = typeof current.engagement === 'string' ? parseFloat(current.engagement) : current.engagement;
      
      return currentEngagement > bestEngagement ? current : best;
    }, data[0]);
  };

  const bestHour = findBestHour();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Golden Hours for Engagement</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-muted-foreground">No data available</p>
          </div>
        ) : (
          <>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis 
                    dataKey="hourFormatted" 
                    tick={{ fontSize: 11 }}
                    interval={1}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="engagement" 
                    fill="#8884d8" 
                    name="Engagement" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {bestHour && (
              <div className="mt-4 p-3 bg-muted/40 rounded-md border">
                <p className="text-sm font-medium">Best Hour for Engagement</p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-2xl font-bold">{bestHour.hourFormatted}</p>
                  <div className="text-right">
                    <p className="text-sm">{bestHour.engagement} interactions per post</p>
                    <p className="text-xs text-muted-foreground">Based on {bestHour.posts} posts</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default GoldenHoursChart;