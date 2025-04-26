// frontend/src/pages/adminUI/components/ChatArea.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { Tooltip } from '@/components/ui/tooltip';
import { TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import ChatMessage from './ChatMessage';
import EmptyChatState from './EmptyChatState';
import ImageUploader from './ImageUploader';
import { getChatMessages, sendAdminMessage, uploadAdminChatImage, getChatDetails } from '../../../../api/adminAPI/adminChatService';
import { useAuth } from '../../../../api/useAuth';

interface ChatAreaProps {
  selectedUser: any;
}

const ChatArea: React.FC<ChatAreaProps> = ({ selectedUser }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatStatus, setChatStatus] = useState('active');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const { user } = useAuth();
  
  // Cuộn xuống tin nhắn mới nhất khi tin nhắn thay đổi
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Lấy thông tin chi tiết về chat khi chọn user
  useEffect(() => {
    const fetchChatDetails = async () => {
      if (selectedUser && selectedUser.id) {
        try {
          setIsLoading(true);
          // Lấy thông tin chi tiết của chat
          const chatDetails = await getChatDetails(selectedUser.id);
          // Cập nhật trạng thái chat
          setChatStatus(chatDetails.status || 'active');
          console.log(`🔍 [ChatArea] Chat status: ${chatDetails.status}`);
        } catch (err) {
          console.error(`❌ [ChatArea] Error fetching chat details:`, err);
        }
      }
    };

    fetchChatDetails();
  }, [selectedUser]);
  
  // Cập nhật tin nhắn khi người dùng được chọn thay đổi
  useEffect(() => {
    if (selectedUser) {
      setIsLoading(true);
      setError(null);
      console.log(`📩 [ChatArea] Loading messages for user: ${selectedUser.id}`);
      
      const unsubscribe = getChatMessages(selectedUser.id, (chatMessages) => {
        setMessages(chatMessages);
        setIsLoading(false);
      });
      
      return () => unsubscribe();
    } else {
      setMessages([]);
    }
  }, [selectedUser]);
  
  const handleSendMessage = async () => {
    if ((!message.trim() && !selectedImage) || !selectedUser) return;
    
    // Kiểm tra trạng thái chat
    if (chatStatus !== 'active') {
      console.error(`❌ [ChatArea] Cannot send message to a ${chatStatus} chat`);
      setError(`Cannot send message to a ${chatStatus} chat`);
      return;
    }
    
    try {
      let imageUrl = null;
      
      if (selectedImage) {
        imageUrl = await uploadAdminChatImage(selectedImage.file, selectedUser.id, user?.uid);
      }
      
      // Tạo tin nhắn mới
      const adminMessage = {
        text: message,
        senderId: user?.uid || "admin",
        senderName: user?.displayName || "Admin",
        senderRole: "admin",
        imageUrl: imageUrl
      };
      
      // Gửi tin nhắn
      await sendAdminMessage(selectedUser.id, adminMessage);
      
      console.log(`✉️ [ChatArea] Sent admin message to user: ${selectedUser.id}`);
      
      // Xóa nội dung tin nhắn và ảnh đã chọn
      setMessage('');
      setSelectedImage(null);
    } catch (err) {
      console.error(`❌ [ChatArea] Error sending message:`, err);
      setError("Failed to send message");
    }
  };
  
  const handleImageUpload = (file) => {
    // Kiểm tra trạng thái chat
    if (chatStatus !== 'active') {
      console.error(`❌ [ChatArea] Cannot upload image to a ${chatStatus} chat`);
      setError(`Cannot upload image to a ${chatStatus} chat`);
      return;
    }
    
    setIsUploading(true);
    console.log('🖼️ [ChatArea] Image selected:', file.name);
    
    // Tạo URL cho ảnh và xử lý kích thước
    const reader = new FileReader();
    reader.onload = (e) => {
      // Kiểm tra kết quả và chuyển đổi thành string nếu cần
      const result = e.target?.result;
      const imageUrl = typeof result === 'string' ? result : '';
      
      // Tạo một đối tượng Image để lấy chiều rộng và chiều cao
      const img = new Image();
      img.onload = () => {
        console.log(`🖼️ [ChatArea] Original image size: ${img.width}x${img.height}`);
        
        // Lưu trữ thông tin ảnh đã được xử lý
        setSelectedImage({
          src: imageUrl,
          originalWidth: img.width,
          originalHeight: img.height,
          file: file
        });
        
        setIsUploading(false);
      };
      img.src = imageUrl;
    };
    reader.readAsDataURL(file);
  };
  
  const handleRemoveImage = () => {
    console.log('🗑️ [ChatArea] Removing selected image');
    setSelectedImage(null);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Nếu không có người dùng nào được chọn
  if (!selectedUser) {
    return <EmptyChatState />;
  }
  
  // Hiển thị thông báo chat đã đóng
  const isChatClosed = chatStatus !== 'active';
  
  return (
    <div className="flex flex-col w-2/3 h-full">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 bg-white flex items-center justify-between">
        <div className="flex items-center">
          <div className="relative">
            <Avatar className="h-10 w-10 border-2 border-white">
              {selectedUser.avatarUrl ? (
                <img 
                  src={selectedUser.avatarUrl} 
                  alt={selectedUser.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-green-100 text-green-800 font-medium">
                  {selectedUser.fullName?.charAt(0) || 'U'}
                </div>
              )}
            </Avatar>
            {selectedUser.online && (
              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
            )}
          </div>
          <div className="ml-3">
            <p className="font-medium">{selectedUser.fullName}</p>
            <p className="text-sm text-gray-500">{selectedUser.email}</p>
          </div>
        </div>
        
        {/* Hiển thị trạng thái chat */}
        <Badge 
          variant="outline" 
          className={isChatClosed 
            ? 'bg-gray-100 text-gray-800 hover:bg-gray-100' 
            : 'bg-green-100 text-green-800 hover:bg-green-100'
          }
        >
          {chatStatus === 'active' ? 'Active' : 'Closed'}
        </Badge>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-center">{error}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            <p className="text-center">No messages yet. Start a conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map(msg => (
              <ChatMessage 
                key={msg.id} 
                message={msg} 
                user={selectedUser}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Thông báo chat đã đóng */}
      {isChatClosed && (
        <div className="border-t border-gray-200 p-4 bg-gray-100 text-center">
          <div className="inline-flex items-center text-gray-700 bg-gray-50 rounded-full px-4 py-2 border">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>This conversation is closed and cannot be continued</span>
          </div>
        </div>
      )}
      
      {/* Selected Image Preview */}
      {selectedImage && !isChatClosed && (
        <div className="border-t border-gray-200 p-2 bg-white">
          <div className="relative inline-block">
            <img 
              src={selectedImage.src} 
              alt="Upload preview" 
              className="h-20 object-cover rounded-md border border-gray-300"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {/* Message Input - ẩn nếu chat đã đóng */}
      {!isChatClosed && (
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="flex space-x-2">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 resize-none min-h-[80px]"
            />
            <div className="flex flex-col space-y-2 justify-end">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="border-gray-300"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Upload Image</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button 
                onClick={handleSendMessage} 
                disabled={!message.trim() && !selectedImage}
                className="self-end bg-green-600 hover:bg-green-700"
              >
                Send
              </Button>
            </div>
            <ImageUploader 
              ref={fileInputRef}
              onImageSelect={handleImageUpload}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatArea;