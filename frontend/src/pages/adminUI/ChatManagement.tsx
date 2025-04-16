// frontend/src/pages/adminUI/ChatManagement.tsx
import React, { useState } from 'react';
import AdminLayout from './components/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AllChatsTab from '../adminUI/components/ChatManagement/AllChatsTab';
import ActiveChatsTab from '../adminUI/components/ChatManagement/ActiveChatsTab';
import AnalyticsTab from '../adminUI/components/ChatManagement/AnalyticsTab';

// Dữ liệu mẫu - sẽ thay thế bằng dữ liệu thực sau này
const chatHistory = [
  {
    id: '1',
    userId: 'user123',
    userName: 'Jane Cooper',
    userEmail: 'jane.cooper@example.com',
    startDate: new Date(2025, 3, 15, 9, 30),
    lastMessageDate: new Date(2025, 3, 15, 10, 45),
    messagesCount: 12,
    status: 'closed',
    topic: 'Diet plan for diabetes'
  },
  {
    id: '2',
    userId: 'user456',
    userName: 'Wade Warren',
    userEmail: 'wade.warren@example.com',
    startDate: new Date(2025, 3, 16, 14, 23),
    lastMessageDate: new Date(2025, 3, 16, 14, 55),
    messagesCount: 8,
    status: 'closed',
    topic: 'Vegetarian recipes'
  },
  {
    id: '3',
    userId: 'user789',
    userName: 'Esther Howard',
    userEmail: 'esther.howard@example.com',
    startDate: new Date(2025, 3, 17, 11, 10),
    lastMessageDate: new Date(2025, 3, 17, 11, 45),
    messagesCount: 15,
    status: 'active',
    topic: 'Gluten-free options'
  },
  {
    id: '4',
    userId: 'user101',
    userName: 'Brooklyn Simmons',
    userEmail: 'brooklyn.simmons@example.com',
    startDate: new Date(2025, 3, 17, 16, 30),
    lastMessageDate: new Date(),
    messagesCount: 5,
    status: 'active',
    topic: 'Low-carb meal plans'
  }
];

const ChatManagement = () => {
  console.log('🔄 [ChatManagement] Rendering Chat Management page');
  
  // Handlers - trong tương lai có thể được chuyển vào một custom hook
  const handleViewChat = (chatId) => {
    console.log(`👁️ [ChatManagement] Viewing chat details: ${chatId}`);
    // Implement navigation to chat detail page
  };

  const handleDeleteChat = (chatId) => {
    console.log(`🗑️ [ChatManagement] Deleting chat: ${chatId}`);
    // Implement chat deletion
  };

  const handleExportChat = (chatId) => {
    console.log(`📤 [ChatManagement] Exporting chat: ${chatId}`);
    // Implement chat export functionality
  };

  const handleResumeChat = (chatId) => {
    console.log(`📱 [ChatManagement] Resuming chat: ${chatId}`);
    // Implement resume chat functionality
  };

  // Tính toán số liệu thống kê
  const chatAnalytics = {
    totalChats: chatHistory.length,
    activeChats: chatHistory.filter(chat => chat.status === 'active').length,
    totalMessages: chatHistory.reduce((sum, chat) => sum + chat.messagesCount, 0),
    avgMessagesPerChat: chatHistory.length > 0 
      ? Math.round(chatHistory.reduce((sum, chat) => sum + chat.messagesCount, 0) / chatHistory.length) 
      : 0
  };

  return (
    <AdminLayout title="Chat History Management">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Chats</TabsTrigger>
            <TabsTrigger value="active">Active Chats</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          {/* All Chats Tab */}
          <TabsContent value="all">
            <AllChatsTab 
              chatHistory={chatHistory} 
              onView={handleViewChat}
              onDelete={handleDeleteChat}
              onExport={handleExportChat}
            />
          </TabsContent>
          
          {/* Active Chats Tab */}
          <TabsContent value="active">
            <ActiveChatsTab 
              chatHistory={chatHistory} 
              onView={handleViewChat}
              onResume={handleResumeChat}
            />
          </TabsContent>
          
          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AnalyticsTab analytics={chatAnalytics} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default ChatManagement;