// frontend/src/pages/adminUI/components/chatManagement/AllChatsTab.tsx
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { format } from 'date-fns';
import ChatTableRow from './ChatTableRow';
import ChatDetailDialog from './ChatDetailDialog';

interface AllChatsTabProps {
  chatHistory: any[];
  onView: (chatId: string) => void;
  onDelete: (chatId: string) => void;
  onExport: (chatId: string) => void;
}

const AllChatsTab: React.FC<AllChatsTabProps> = ({ 
  chatHistory, 
  onView, 
  onDelete, 
  onExport 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedChat, setSelectedChat] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    console.log(`🔍 [AllChatsTab] Searching for: ${e.target.value}`);
  };

  const handleExportAllData = () => {
    console.log('📊 [AllChatsTab] Exporting all chats data');
    // Implement export all functionality
  };
  
  const handleViewChat = (chatId) => {
    console.log(`👁️ [AllChatsTab] Viewing chat details: ${chatId}`);
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setSelectedChat(chat);
      setIsDetailOpen(true);
    }
  };

  // Filter chats based on search term, date and status
  const filteredChats = chatHistory.filter(chat => {
    const matchesSearch = 
      chat.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.topic.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || chat.status === statusFilter;
    
    let matchesDate = true;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (dateFilter === 'today') {
      matchesDate = chat.lastMessageDate.toDateString() === today.toDateString();
    } else if (dateFilter === 'yesterday') {
      matchesDate = chat.lastMessageDate.toDateString() === yesterday.toDateString();
    } else if (dateFilter === 'week') {
      const oneWeekAgo = new Date(today);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      matchesDate = chat.lastMessageDate >= oneWeekAgo;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            type="text"
            placeholder="Search chats..."
            className="w-full md:w-80"
            value={searchTerm}
            onChange={handleSearch}
          />
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Date filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button 
          className="bg-green-600 hover:bg-green-700"
          onClick={handleExportAllData}
        >
          Export Data
        </Button>
      </div>
      
      {/* Chat History Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Date Started</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Messages</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No chat history found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredChats.map(chat => (
                  <ChatTableRow 
                    key={chat.id}
                    chat={chat}
                    onView={handleViewChat}
                    onDelete={onDelete}
                    onExport={onExport}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
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

export default AllChatsTab;