// frontend/src/pages/adminUI/AssistantChat.tsx
import React, { useState } from 'react';
import AdminLayout from './components/AdminLayout';
import UserSidebar from './components/UserSidebar';
import ChatArea from './components/ChatArea';

const AssistantChat = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Log khi người dùng được chọn
  const handleUserSelect = (user) => {
    console.log('🔄 [AdminChat] Selected user:', user);
    setSelectedUser(user);
  };

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