// frontend/src/pages/adminUI/ChatManagement.tsx
import React, { useState, useEffect } from 'react';
import AdminLayout from './components/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AllChatsTab from './components/ChatManagement/AllChatsTab';
import ActiveChatsTab from './components/ChatManagement/ActiveChatsTab';
import AnalyticsTab from './components/ChatManagement/AnalyticsTab';
import { useRouter } from 'next/router';
import { useAuth } from '../../api/useAuth';
import { 
  getAllChatsForManagement, 
  updateChatStatus, 
  deleteChat, 
  exportChatData,
  getChatAnalytics
} from '../../api/adminAPI/adminChatManagementService';

const ChatManagement = () => {
  const router = useRouter();
  const { user, userRole, loading } = useAuth();
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalChats: 0,
    activeChats: 0,
    totalMessages: 0,
    avgMessagesPerChat: 0
  });
  
  // Kiểm tra quyền admin
  useEffect(() => {
    if (!loading && (user === null || userRole !== 'admin')) {
      console.log('❌ [ChatManagement] Unauthorized access, redirecting to home');
      router.push('/');
    }
  }, [user, userRole, loading, router]);
  
  // Fetch dữ liệu chat khi component mount
  useEffect(() => {
    const fetchData = async () => {
      if (user && userRole === 'admin') {
        try {
          setIsLoading(true);
          setError(null);
          
          // Fetch danh sách chat
          const chats = await getAllChatsForManagement();
          setChatHistory(chats);
          
          // Fetch phân tích
          const analyticsData = await getChatAnalytics();
          setAnalytics(analyticsData);
          
          setIsLoading(false);
        } catch (err) {
          console.error('❌ [ChatManagement] Error fetching data:', err);
          setError('Failed to load chat history. Please try again.');
          setIsLoading(false);
        }
      }
    };
    
    fetchData();
  }, [user, userRole]);
  
  console.log('🔄 [ChatManagement] Rendering Chat Management page');
  
  // Handlers
  const handleViewChat = (chatId) => {
    console.log(`👁️ [ChatManagement] Viewing chat details: ${chatId}`);
    // Chuyển tới đối thoại chi tiết
  };

  const handleDeleteChat = async (chatId) => {
    try {
      console.log(`🗑️ [ChatManagement] Deleting chat: ${chatId}`);
      await deleteChat(chatId);
      
      // Cập nhật lại danh sách sau khi xóa
      setChatHistory(prevChats => prevChats.filter(chat => chat.id !== chatId));
    } catch (err) {
      console.error('❌ [ChatManagement] Error deleting chat:', err);
      alert('Failed to delete chat. Please try again.');
    }
  };

  const handleExportChat = async (chatId) => {
    try {
      console.log(`📤 [ChatManagement] Exporting chat: ${chatId}`);
      const exportData = await exportChatData(chatId);
      
      // Tạo file JSON và tải xuống
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `chat_${chatId}_export.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (err) {
      console.error('❌ [ChatManagement] Error exporting chat:', err);
      alert('Failed to export chat. Please try again.');
    }
  };

  const handleResumeChat = (chatId) => {
    console.log(`📱 [ChatManagement] Resuming chat: ${chatId}`);
    router.push(`/adminUI/AssistantChat?chatId=${chatId}`);
  };
  
  const handleCloseChat = async (chatId) => {
    try {
      console.log(`🔒 [ChatManagement] Closing chat: ${chatId}`);
      await updateChatStatus(chatId, 'closed');
      
      // Cập nhật lại danh sách sau khi đóng chat
      setChatHistory(prevChats => 
        prevChats.map(chat => 
          chat.id === chatId ? { ...chat, status: 'closed' } : chat
        )
      );
    } catch (err) {
      console.error('❌ [ChatManagement] Error closing chat:', err);
      alert('Failed to close chat. Please try again.');
    }
  };

  // Hiển thị màn hình loading
  if (loading || isLoading) {
    return (
      <AdminLayout title="Chat History Management">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Chat History Management">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
            <button 
              className="underline mt-2"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </div>
        ) : (
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
              <AnalyticsTab analytics={analytics} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AdminLayout>
  );
};


export const getServerSideProps = async (context) => {
  return {
    props: {}, // Will be passed to the page component as props
  }
};

export default ChatManagement;