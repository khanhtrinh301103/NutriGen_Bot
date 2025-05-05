// src/pages/adminUI/components/PostsManagement/InteractionTrendsChart.tsx

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format, parseISO } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface TrendData {
  date: string;
  posts: number;
  likes: number;
  comments: number;
}

interface InteractionTrendsChartProps {
  data: TrendData[];
  isLoading: boolean;
  timeframe: string;
  onTimeframeChange: (value: string) => void;
  days: number;
  onDaysChange: (value: number) => void;
}

const InteractionTrendsChart: React.FC<InteractionTrendsChartProps> = ({
  data,
  isLoading,
  timeframe,
  onTimeframeChange,
  days,
  onDaysChange,
}) => {
  // Format the date based on timeframe
  const formatXAxis = (tickItem: string) => {
    if (!tickItem) return '';
    
    try {
      let date;
      if (timeframe === 'month') {
        // For month timeframe, tickItem is in format YYYY-MM
        const [year, month] = tickItem.split('-');
        date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return format(date, 'MMM yyyy');
      } else {
        // For day and week timeframe, tickItem is in format YYYY-MM-DD
        date = parseISO(tickItem);
        return timeframe === 'day' ? format(date, 'MMM dd') : format(date, 'MMM dd');
      }
    } catch (e) {
      console.error('Error formatting date:', e);
      return tickItem;
    }
  };
  
  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md shadow-md p-3">
          <p className="font-medium">{formatXAxis(label)}</p>
          <div className="mt-2 space-y-1">
            <p className="text-[#8884d8] text-sm">Posts: {payload[0].value}</p>
            <p className="text-[#82ca9d] text-sm">Likes: {payload[1].value}</p>
            <p className="text-[#ffc658] text-sm">Comments: {payload[2].value}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Interaction Trends</CardTitle>
        <div className="flex space-x-2">
          <Select value={timeframe} onValueChange={onTimeframeChange}>
            <SelectTrigger className="h-8 w-[110px]">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Daily</SelectItem>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={days.toString()} 
            onValueChange={(value) => onDaysChange(parseInt(value))}
          >
            <SelectTrigger className="h-8 w-[110px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 Days</SelectItem>
              <SelectItem value="30">30 Days</SelectItem>
              <SelectItem value="90">90 Days</SelectItem>
              <SelectItem value="180">6 Months</SelectItem>
              <SelectItem value="365">1 Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="h-[300px]">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">No data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatXAxis}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />
              <Line 
                type="monotone" 
                dataKey="posts" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                name="Posts"
              />
              <Line 
                type="monotone" 
                dataKey="likes" 
                stroke="#82ca9d" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                name="Likes"
              />
              <Line 
                type="monotone" 
                dataKey="comments" 
                stroke="#ffc658" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                name="Comments"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};


export const getServerSideProps = async (context) => {
  return {
    props: {}, // Will be passed to the page component as props
  }
};

export default InteractionTrendsChart;