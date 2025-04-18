// frontend/src/pages/adminUI/components/chat/UserSidebar.tsx
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getAllChats } from '../../../api/adminAPI/adminChatService';

interface UserSidebarProps {
  onSelectUser: (user: any) => void;
  selectedUser: any;
}

const UserSidebar: React.FC<UserSidebarProps> = ({ onSelectUser, selectedUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = getAllChats((chats) => {
      setUsers(chats);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🔍 [UserSidebar] Searching for:', e.target.value);
    setSearchTerm(e.target.value);
  };
  
  // Lọc danh sách người dùng theo cụm từ tìm kiếm
  const filteredUsers = users.filter(user => 
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Format thời gian hiển thị
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };
  
  return (
    <div className="w-1/3 border-r border-gray-200 bg-gray-50">
      <div className="p-4 border-b">
        <Input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full"
        />
      </div>
      
      <div className="overflow-y-auto h-full">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No users found
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredUsers.map(user => (
              <li 
                key={user.id}
                className={`hover:bg-gray-100 cursor-pointer transition-colors ${
                  selectedUser?.id === user.id ? 'bg-gray-100' : ''
                }`}
                onClick={() => onSelectUser(user)}
              >
                <div className="flex items-center p-4">
                  <div className="relative">
                    <Avatar className="h-12 w-12 border-2 border-white">
                      {user.avatarUrl ? (
                        <img 
                          src={user.avatarUrl} 
                          alt={user.fullName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-green-100 text-green-800 font-medium text-lg">
                          {user.fullName.charAt(0)}
                        </div>
                      )}
                    </Avatar>
                    {user.online && (
                      <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
                    )}
                  </div>
                  
                  <div className="ml-3 flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 truncate">{user.fullName}</p>
                      <p className="text-xs text-gray-500">{formatTimestamp(user.timestamp)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500 truncate">{user.lastMessage}</p>
                      {user.unread > 0 && (
                        <Badge variant="destructive" className="ml-2 rounded-full">
                          {user.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UserSidebar;