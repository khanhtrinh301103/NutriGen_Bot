// frontend/src/pages/adminUI/components/chat/UserSidebar.tsx
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

// Dữ liệu mẫu người dùng - sẽ được thay thế bằng dữ liệu thực khi tích hợp
const MOCK_USERS = [
  {
    id: '1',
    fullName: 'Jane Cooper',
    email: 'jane.cooper@example.com',
    lastMessage: 'Hello, can you help me with my diet plan?',
    timestamp: '10:23 AM',
    unread: 3,
    online: true,
    avatarUrl: null
  },
  {
    id: '2',
    fullName: 'Wade Warren',
    email: 'wade.warren@example.com',
    lastMessage: 'Thanks for your help!',
    timestamp: 'Yesterday',
    unread: 0,
    online: false,
    avatarUrl: null
  },
  {
    id: '3',
    fullName: 'Esther Howard',
    email: 'esther.howard@example.com',
    lastMessage: 'I have a question about allergies',
    timestamp: 'Apr 12',
    unread: 1,
    online: true, 
    avatarUrl: null
  },
  {
    id: '4',
    fullName: 'Cameron Williamson',
    email: 'cameron.williamson@example.com',
    lastMessage: 'Looking for low-carb recipes',
    timestamp: 'Mar 28',
    unread: 0,
    online: false,
    avatarUrl: null
  },
  {
    id: '5',
    fullName: 'Brooklyn Simmons',
    email: 'brooklyn.simmons@example.com',
    lastMessage: 'How do I track my calories?',
    timestamp: 'Mar 24',
    unread: 0,
    online: false,
    avatarUrl: null
  }
];

interface UserSidebarProps {
  onSelectUser: (user: any) => void;
  selectedUser: any;
}

const UserSidebar: React.FC<UserSidebarProps> = ({ onSelectUser, selectedUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🔍 [UserSidebar] Searching for:', e.target.value);
    setSearchTerm(e.target.value);
  };
  
  // Lọc danh sách người dùng theo cụm từ tìm kiếm
  const filteredUsers = MOCK_USERS.filter(user => 
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
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
        {filteredUsers.length === 0 ? (
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
                      <div className="flex h-full w-full items-center justify-center bg-green-100 text-green-800 font-medium text-lg">
                        {user.fullName.charAt(0)}
                      </div>
                    </Avatar>
                    {user.online && (
                      <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
                    )}
                  </div>
                  
                  <div className="ml-3 flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 truncate">{user.fullName}</p>
                      <p className="text-xs text-gray-500">{user.timestamp}</p>
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