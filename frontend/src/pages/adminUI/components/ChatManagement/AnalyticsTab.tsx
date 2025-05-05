// frontend/src/pages/adminUI/components/ChatManagement/AnalyticsTab.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AnalyticsSummaryCards from './AnalyticsSummaryCards';
import { getChatAnalytics } from '../../../../api/adminAPI/adminChatManagementService';

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
          <CardTitle>Chat Status Distribution</CardTitle>
          <CardDescription>Active vs. Closed chats</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <div className="h-full flex items-center justify-center">
            <div className="w-full max-w-md">
              <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-green-500"
                  style={{ width: `${(analytics.activeChats / analytics.totalChats) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                  <span>Active ({analytics.activeChats})</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-300 rounded-full mr-1"></div>
                  <span>Closed ({analytics.totalChats - analytics.activeChats})</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Messages Per Chat</CardTitle>
            <CardDescription>Average message count per conversation</CardDescription>
          </CardHeader>
          <CardContent className="h-60">
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl font-bold text-green-600">
                  {analytics.avgMessagesPerChat}
                </div>
                <p className="text-gray-500 mt-2">Average messages per chat</p>
                <p className="text-gray-500 mt-1">
                  Total: {analytics.totalMessages} messages across {analytics.totalChats} chats
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>User Engagement</CardTitle>
            <CardDescription>Active users and their involvement</CardDescription>
          </CardHeader>
          <CardContent className="h-60 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">
                {analytics.totalChats} 
              </div>
              <p className="text-gray-500 mt-2">Total chat sessions</p>
              <p className="text-gray-500 mt-4">
                More detailed user analytics will be available in future updates.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};


export const getServerSideProps = async (context) => {
  return {
    props: {}, // Will be passed to the page component as props
  }
};

export default AnalyticsTab;