// frontend/src/pages/adminUI/components/chatManagement/AnalyticsTab.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AnalyticsSummaryCards from './AnalyticsSummaryCards';

interface AnalyticsTabProps {
  analytics: {
    totalChats: number;
    activeChats: number;
    totalMessages: number;
    avgMessagesPerChat: number;
  };
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ analytics }) => {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <AnalyticsSummaryCards analytics={analytics} />
      
      {/* Chat Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Chat History Distribution</CardTitle>
          <CardDescription>Chat activity over time</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-gray-500">
            Charts and detailed analytics would be displayed here
          </p>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Popular Topics</CardTitle>
            <CardDescription>Most discussed topics in chats</CardDescription>
          </CardHeader>
          <CardContent className="h-60 flex items-center justify-center">
            <p className="text-gray-500">
              Topic distribution chart would be displayed here
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>User Engagement</CardTitle>
            <CardDescription>Most active users</CardDescription>
          </CardHeader>
          <CardContent className="h-60 flex items-center justify-center">
            <p className="text-gray-500">
              User engagement metrics would be displayed here
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsTab;