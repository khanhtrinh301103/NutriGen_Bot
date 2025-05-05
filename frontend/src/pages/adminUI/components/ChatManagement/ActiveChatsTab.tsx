// frontend/src/pages/adminUI/components/chatManagement/ActiveChatsTab.tsx
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { format } from 'date-fns';
import ActiveChatCard from './ActiveChatCard';
import ChatDetailDialog from './ChatDetailDialog';

interface ActiveChatsTabProps {
  chatHistory: any[];
  onView: (chatId: string) => void;
  onResume: (chatId: string) => void;
}

const ActiveChatsTab: React.FC<ActiveChatsTabProps> = ({ 
  chatHistory, 
  onView,
  onResume
}) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const activeChats = chatHistory.filter(chat => chat.status === 'active');

  const handleViewChat = (chatId) => {
    console.log(`👁️ [ActiveChatsTab] Viewing chat details: ${chatId}`);
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setSelectedChat(chat);
      setIsDetailOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeChats.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-white rounded-lg border">
            <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No active chats</h3>
            <p className="mt-1 text-sm text-gray-500">There are no active chats at the moment.</p>
          </div>
        ) : (
          activeChats.map(chat => (
            <ActiveChatCard 
              key={chat.id}
              chat={chat}
              onView={handleViewChat}
              onResume={onResume}
            />
          ))
        )}
      </div>
      
      {/* Chat Detail Dialog */}
      <ChatDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        chat={selectedChat}
      />
    </div>
  );
};


export const getServerSideProps = async (context) => {
  return {
    props: {}, // Will be passed to the page component as props
  }
};

export default ActiveChatsTab;