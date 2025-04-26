// frontend/src/pages/adminUI/AssistantChat.tsx
import React, { useState, useEffect } from 'react';
import AdminLayout from './components/AdminLayout';
import UserSidebar from './components/AdminChat/UserSidebar';
import ChatArea from './components/AdminChat/ChatArea';
import { useAuth } from '../../api/useAuth';
import { useRouter } from 'next/router';
import { getChatDetails } from '../../api/adminAPI/adminChatService';

const AssistantChat = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [error, setError] = useState(null);
  const { user, userRole, loading } = useAuth();
  const router = useRouter();
  const { chatId } = router.query;
  
  // Kiểm tra quyền admin
  useEffect(() => {
    if (!loading && (user === null || userRole !== 'admin')) {
      console.log('❌ [AdminChat] Unauthorized access, redirecting to home');
      router.push('/');
    }
  }, [user, userRole, loading, router]);
  
  // Nếu có chatId trong URL, tự động chọn chat đó
  useEffect(() => {
    const fetchChatFromUrl = async () => {
      if (chatId && typeof chatId === 'string') {
        try {
          setIsLoadingChat(true);
          setError(null);
          
          console.log(`🔄 [AdminChat] Auto-selecting chat from URL: ${chatId}`);
          
          // Lấy thông tin chi tiết của chat
          const chatDetails = await getChatDetails(chatId);
          
          // Kiểm tra nếu chat đã đóng, hiển thị cảnh báo
          if (chatDetails.status !== 'active') {
            console.warn(`⚠️ [AdminChat] Attempting to open a ${chatDetails.status} chat: ${chatId}`);
          }
          
          // Lấy thông tin người dùng
          const userData = chatDetails.userDetails || {};
          
          // Tạo đối tượng user để hiển thị
          setSelectedUser({
            id: chatId,
            userId: chatDetails.userId,
            fullName: userData.fullName || 'Unknown User',
            email: userData.email || '',
            status: chatDetails.status
          });
          
          setIsLoadingChat(false);
        } catch (err) {
          console.error(`❌ [AdminChat] Error loading chat from URL:`, err);
          setError(`Could not load chat: ${err.message}`);
          setIsLoadingChat(false);
        }
      }
    };
    
    fetchChatFromUrl();
  }, [chatId]);
  
  // Log khi người dùng được chọn
  const handleUserSelect = (user) => {
    console.log('🔄 [AdminChat] Selected user:', user);
    setSelectedUser(user);
  };

  if (loading || !user) {
    return (
      <AdminLayout title="Assistant Chat">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      </AdminLayout>
    );
  }
  
  if (error) {
    return (
      <AdminLayout title="Assistant Chat">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p>{error}</p>
            <button
              onClick={() => router.push('/adminUI/ChatManagement')}
              className="mt-2 text-sm underline"
            >
              Return to Chat Management
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Assistant Chat">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="h-[70vh] flex">
            {/* User Sidebar */}
            <UserSidebar onSelectUser={handleUserSelect} selectedUser={selectedUser} />
            
            {/* Chat Area */}
            <ChatArea selectedUser={selectedUser} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AssistantChat;