// src/pages/adminUI/components/PostsManagement/CaptionAnalysisChart.tsx

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ZAxis,
  ReferenceArea
} from 'recharts';
import { Loader2 } from 'lucide-react';

interface ScatterData {
  id: string;
  captionLength: number;
  totalInteractions: number;
  engagement: number | string;
}

interface CaptionAnalysisChartProps {
  data: ScatterData[];
  isLoading: boolean;
}

const CaptionAnalysisChart: React.FC<CaptionAnalysisChartProps> = ({
  data,
  isLoading,
}) => {
  // Find optimal range and average
  const findOptimalRange = () => {
    if (!data || data.length === 0) return null;
    
    // Group by caption length ranges (every 50 characters)
    const ranges: { [key: string]: { count: number, totalInteractions: number, avg: number } } = {};
    const rangeSize = 50;
    
    data.forEach(item => {
      const rangeStart = Math.floor(item.captionLength / rangeSize) * rangeSize;
      const rangeKey = `${rangeStart}-${rangeStart + rangeSize}`;
      
      if (!ranges[rangeKey]) {
        ranges[rangeKey] = { count: 0, totalInteractions: 0, avg: 0 };
      }
      
      ranges[rangeKey].count++;
      ranges[rangeKey].totalInteractions += item.totalInteractions;
    });
    
    // Calculate average for each range
    for (const key in ranges) {
      if (ranges[key].count > 0) {
        ranges[key].avg = ranges[key].totalInteractions / ranges[key].count;
      }
    }
    
    // Find range with highest average
    let bestRange = null;
    let bestAvg = 0;
    
    for (const key in ranges) {
      if (ranges[key].count >= 3 && ranges[key].avg > bestAvg) { // At least 3 posts to be significant
        bestAvg = ranges[key].avg;
        bestRange = key;
      }
    }
    
    if (!bestRange) return null;
    
    const [min, max] = bestRange.split('-').map(Number);
    return { min, max, avg: bestAvg, count: ranges[bestRange].count };
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md shadow-md p-3">
          <p className="font-medium">Caption Analysis</p>
          <div className="mt-2 space-y-1">
            <p className="text-sm">Caption Length: {payload[0].payload.captionLength} characters</p>
            <p className="text-sm">Interactions: {payload[0].payload.totalInteractions}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  const optimalRange = findOptimalRange();

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Caption Length Analysis</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">No data available</p>
          </div>
        ) : (
          <>
            <div className="flex-1 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis 
                    type="number" 
                    dataKey="captionLength" 
                    name="Caption Length" 
                    unit=" chars"
                    domain={[0, 'dataMax']} 
                  />
                  <YAxis 
                    type="number" 
                    dataKey="totalInteractions" 
                    name="Interactions" 
                  />
                  <ZAxis range={[40, 400]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Scatter 
                    name="Caption vs. Interactions" 
                    data={data} 
                    fill="#8884d8"
                  />
                  {optimalRange && (
                    <ReferenceArea 
                      x1={optimalRange.min} 
                      x2={optimalRange.max} 
                      stroke="rgba(136, 132, 216, 0.3)" 
                      strokeOpacity={0.3} 
                      fill="rgba(136, 132, 216, 0.3)" 
                    />
                  )}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            
            {optimalRange && (
              <div className="mt-2 p-3 bg-muted/40 rounded-md border">
                <p className="text-sm font-medium">Optimal Caption Length</p>
                <div className="mt-1">
                  <p className="text-xl font-bold">{optimalRange.min}-{optimalRange.max} characters</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on {optimalRange.count} posts with an average of{' '}
                    {Math.round(optimalRange.avg)} interactions per post
                  </p>
                </div>
              </div>
            )}
          </>
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

export default CaptionAnalysisChart;