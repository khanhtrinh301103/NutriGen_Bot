// frontend/src/pages/adminUI/components/chatManagement/AnalyticsSummaryCards.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface AnalyticsSummaryCardsProps {
  analytics: {
    totalChats: number;
    activeChats: number;
    totalMessages: number;
    avgMessagesPerChat: number;
  };
}

const AnalyticsSummaryCards: React.FC<AnalyticsSummaryCardsProps> = ({ analytics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-gray-500">Total Chats</p>
            <p className="text-3xl font-bold mt-2">{analytics.totalChats}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-gray-500">Active Chats</p>
            <p className="text-3xl font-bold mt-2">{analytics.activeChats}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-gray-500">Total Messages</p>
            <p className="text-3xl font-bold mt-2">{analytics.totalMessages}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-gray-500">Avg. Messages per Chat</p>
            <p className="text-3xl font-bold mt-2">{analytics.avgMessagesPerChat}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsSummaryCards;