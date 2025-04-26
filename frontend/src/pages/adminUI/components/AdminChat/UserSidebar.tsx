// frontend/src/pages/adminUI/components/AdminChat/UserSidebar.tsx
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getAllChats, archiveChat, acceptChat } from '@/api/adminAPI/adminChatService';
import { useAuth } from '@/api/useAuth';

interface UserSidebarProps {
  onSelectUser: (user: any) => void;
  selectedUser: any;
}

const UserSidebar: React.FC<UserSidebarProps> = ({ onSelectUser, selectedUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignmentFilter, setAssignmentFilter] = useState('all'); // Thêm filter theo phân công
  const [showClosedChats, setShowClosedChats] = useState(true);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user || !user.uid) return;
    
    const unsubscribe = getAllChats((chats) => {
      setUsers(chats);
      setLoading(false);
    }, user.uid); // Truyền ID của admin hiện tại
    
    return () => unsubscribe();
  }, [user]);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🔍 [UserSidebar] Searching for:', e.target.value);
    setSearchTerm(e.target.value);
  };
  
  // Xử lý ẩn chat
  const handleArchiveChat = async (chatId, e) => {
    e.stopPropagation(); // Ngăn chặn sự kiện click lan tỏa đến phần tử cha
    
    try {
      console.log(`📦 [UserSidebar] Archiving chat: ${chatId}`);
      await archiveChat(chatId);
      
      // Chat sẽ tự động được cập nhật thông qua listener getAllChats
    } catch (err) {
      console.error(`❌ [UserSidebar] Error archiving chat:`, err);
      alert('Failed to archive chat. Please try again.');
    }
  };
  
  // Xử lý chấp nhận chat
  const handleAcceptChat = async (chatId, e) => {
    e.stopPropagation(); // Ngăn chặn sự kiện click lan tỏa đến phần tử cha
    
    if (!user || !user.uid) {
      console.error('❌ [UserSidebar] Cannot accept chat: No admin user found');
      return;
    }
    
    try {
      console.log(`🔄 [UserSidebar] Accepting chat: ${chatId}`);
      await acceptChat(chatId, user.uid, user.displayName || 'Admin');
      
      // Chat sẽ tự động được cập nhật thông qua listener getAllChats
      console.log(`✅ [UserSidebar] Chat accepted: ${chatId}`);
    } catch (err) {
      console.error(`❌ [UserSidebar] Error accepting chat:`, err);
      alert(`Failed to accept chat: ${err.message}`);
    }
  };
  
  // Lọc danh sách người dùng theo cụm từ tìm kiếm và trạng thái
  const filteredUsers = users.filter(user => {
    // Lọc theo từ khóa
    const matchesSearch = 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.topic && user.topic.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Lọc theo trạng thái
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    // Lọc theo phân công
    const matchesAssignment = 
      assignmentFilter === 'all' || 
      (assignmentFilter === 'assigned' && user.isAssigned) ||
      (assignmentFilter === 'unassigned' && user.canAccept) ||
      (assignmentFilter === 'others' && user.assignedAdmin && !user.isAssigned);
    
    // Lọc theo tùy chọn hiển thị chat đã đóng
    const matchesShowClosed = showClosedChats || user.status !== 'closed';
    
    return matchesSearch && matchesStatus && matchesAssignment && matchesShowClosed;
  });
  
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
  
  // Lấy style cho badge trạng thái
  const getStatusBadgeStyles = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'archived':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Lấy style cho badge phân công
  const getAssignmentBadgeStyles = (isAssigned, canAccept) => {
    if (isAssigned) {
      return 'bg-blue-100 text-blue-800';
    } else if (canAccept) {
      return 'bg-green-100 text-green-800';
    } else {
      return 'bg-gray-100 text-gray-500';
    }
  };
  
  return (
    <div className="w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col">
      <div className="p-4 border-b">
        <Input
          type="text"
          placeholder="Search users, topics..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full mb-3"
        />
        
        <div className="flex flex-wrap gap-2 mt-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={assignmentFilter} onValueChange={setAssignmentFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Assignment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Chats</SelectItem>
              <SelectItem value="assigned">My Chats</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              <SelectItem value="others">Other Admin's</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center space-x-2 ml-auto">
            <Checkbox 
              id="showClosed" 
              checked={showClosedChats}
              onCheckedChange={(checked) => setShowClosedChats(checked === true)}
            />
            <label
              htmlFor="showClosed"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Show Closed
            </label>
          </div>
        </div>
      </div>
      
      <div className="overflow-y-auto flex-1">
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
                <div className="flex flex-col p-4">
                  <div className="flex items-center">
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
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-gray-500 truncate">{user.lastMessage}</p>
                      </div>
                      
                      {/* Hiển thị chủ đề và trạng thái phân công */}
                      <div className="flex items-center mt-1 flex-wrap gap-1">
                        {/* Badge chủ đề */}
                        {user.topic && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                            {user.topic}
                          </Badge>
                        )}
                        
                        {/* Badge trạng thái */}
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getStatusBadgeStyles(user.status)}`}
                        >
                          {user.status}
                        </Badge>
                        
                        {/* Badge phân công */}
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getAssignmentBadgeStyles(user.isAssigned, user.canAccept)}`}
                        >
                          {user.isAssigned ? 'My Chat' : user.canAccept ? 'Open' : user.assignedAdmin ? 'Assigned' : 'Waiting'}
                        </Badge>
                        
                        {user.unread > 0 && (
                          <Badge variant="destructive" className="ml-auto rounded-full">
                            {user.unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Hiển thị nút ẩn và chấp nhận chat */}
                  <div className="flex mt-2 justify-end space-x-2">
                    {/* Hiển thị nút chấp nhận nếu chat có thể tiếp nhận */}
                    {user.status === 'active' && !user.assignedAdmin && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost" 
                              size="sm"
                              className="h-7 py-0 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={(e) => handleAcceptChat(user.id, e)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Accept
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Accept this conversation to respond</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    
                    {/* Hiển thị nút ẩn nếu trạng thái là closed */}
                    {user.status === 'closed' && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost" 
                              size="sm"
                              className="h-7 py-0 px-2 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                              onClick={(e) => handleArchiveChat(user.id, e)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                              </svg>
                              Archive
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Archive this conversation</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
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