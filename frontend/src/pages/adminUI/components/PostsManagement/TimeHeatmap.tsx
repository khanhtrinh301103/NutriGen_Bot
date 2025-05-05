// src/pages/adminUI/components/PostsManagement/TimeHeatmap.tsx

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface HeatmapData {
  day: string;
  hour: string;
  value: number;
}

interface TimeHeatmapProps {
  data: HeatmapData[];
  isLoading: boolean;
}

const TimeHeatmap: React.FC<TimeHeatmapProps> = ({
  data,
  isLoading,
}) => {
  // Helper function to get cell background color based on value
  const getCellBackground = (value: number) => {
    // Find the max value for normalization
    const maxValue = Math.max(...data.map(d => d.value));
    
    if (value === 0) return 'bg-muted';
    if (maxValue === 0) return 'bg-muted';
    
    // Normalize value between 0 and 100
    const intensity = Math.min(Math.floor((value / maxValue) * 100), 100);
    
    // Return appropriate CSS class based on intensity
    if (intensity < 20) return 'bg-green-100';
    if (intensity < 40) return 'bg-green-200';
    if (intensity < 60) return 'bg-green-300';
    if (intensity < 80) return 'bg-green-400';
    return 'bg-green-500';
  };

  // Format hour for display
  const formatHour = (hour: string) => {
    const hourNum = parseInt(hour);
    return hourNum === 0 ? '12 AM' : 
           hourNum < 12 ? `${hourNum} AM` :
           hourNum === 12 ? '12 PM' : 
           `${hourNum - 12} PM`;
  };

  // Prepare the data grid
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const hours = Array.from({ length: 24 }, (_, i) => i.toString());
  
  // Create a map for quick lookup
  const dataMap = new Map();
  data.forEach(item => {
    dataMap.set(`${item.day}-${item.hour}`, item.value);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Posting Time Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="overflow-auto">
            <div className="grid grid-cols-[auto_repeat(24,minmax(30px,1fr))] gap-1">
              {/* Header row for hours */}
              <div className="text-xs font-medium text-muted-foreground p-2"></div>
              {hours.map(hour => (
                <div key={`hour-${hour}`} className="text-xs font-medium text-muted-foreground p-1 text-center">
                  {parseInt(hour) % 3 === 0 ? formatHour(hour) : ''}
                </div>
              ))}
              
              {/* Data rows */}
              {daysOfWeek.map(day => (
                <React.Fragment key={`day-${day}`}>
                  <div className="text-xs font-medium p-2">{day.slice(0, 3)}</div>
                  {hours.map(hour => {
                    const value = dataMap.get(`${day}-${hour}`) || 0;
                    return (
                      <div 
                        key={`${day}-${hour}`} 
                        className={`w-full h-8 rounded ${getCellBackground(value)} flex items-center justify-center`}
                        title={`${day} at ${formatHour(hour)}: ${value} posts`}
                      >
                        <span className="text-xs font-medium">
                          {value > 0 ? value : ''}
                        </span>
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
            
            {/* Legend */}
            <div className="mt-4 flex items-center justify-end space-x-2">
              <span className="text-xs text-muted-foreground">Fewer</span>
              <div className="flex space-x-1">
                <div className="w-4 h-4 bg-green-100 rounded"></div>
                <div className="w-4 h-4 bg-green-200 rounded"></div>
                <div className="w-4 h-4 bg-green-300 rounded"></div>
                <div className="w-4 h-4 bg-green-400 rounded"></div>
                <div className="w-4 h-4 bg-green-500 rounded"></div>
              </div>
              <span className="text-xs text-muted-foreground">More</span>
            </div>
          </div>
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

export default TimeHeatmap;