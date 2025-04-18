// frontend/src/pages/adminUI/AssistantChat.tsx
import React, { useState, useEffect } from 'react';
import AdminLayout from './components/AdminLayout';
import UserSidebar from './components/UserSidebar';
import ChatArea from './components/ChatArea';
import { useAuth } from '../../api/useAuth';
import { useRouter } from 'next/router';

const AssistantChat = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const { user, userRole, loading } = useAuth();
  const router = useRouter();
  
  // Kiểm tra quyền admin
  useEffect(() => {
    if (!loading && (user === null || userRole !== 'admin')) {
      console.log('❌ [AdminChat] Unauthorized access, redirecting to home');
      router.push('/');
    }
  }, [user, userRole, loading, router]);
  
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