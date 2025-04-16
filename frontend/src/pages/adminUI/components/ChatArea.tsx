// frontend/src/pages/adminUI/components/chat/ChatArea.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { Tooltip } from '@/components/ui/tooltip';
import { TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ChatMessage from './ChatMessage';
import EmptyChatState from './EmptyChatState';
import ImageUploader from './ImageUploader';

// Dữ liệu mẫu tin nhắn - sẽ được thay thế bằng dữ liệu thực khi tích hợp
const MOCK_MESSAGES = {
  '1': [
    {
      id: '1',
      senderId: '1',
      text: 'Hello, can you help me with my diet plan?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      isAdmin: false
    },
    {
      id: '2',
      senderId: 'admin',
      text: 'Hi there! I\'d be happy to help with your diet plan. What specific aspects are you looking to improve?',
      timestamp: new Date(Date.now() - 1000 * 60 * 59).toISOString(),
      isAdmin: true
    },
    {
      id: '3',
      senderId: '1',
      text: 'I want to lose weight but I have dairy allergies. What kind of diet should I follow?',
      timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
      isAdmin: false
    },
    {
      id: '4',
      senderId: 'admin',
      text: 'For weight loss with dairy allergies, I recommend focusing on lean proteins, plenty of vegetables, and dairy alternatives like almond or oat milk. Would you like me to suggest some specific meal ideas?',
      timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
      isAdmin: true
    },
    {
      id: '5',
      senderId: '1',
      text: 'Yes, please! That would be very helpful.',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      isAdmin: false
    },
  ],
  '3': [
    {
      id: '1',
      senderId: '3',
      text: 'I have a question about allergies',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      isAdmin: false
    },
    {
      id: '2',
      senderId: 'admin',
      text: 'Hi! I\'d be happy to help with your allergy questions. What would you like to know?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 60 * 5).toISOString(),
      isAdmin: true
    },
  ]
};

interface ChatAreaProps {
  selectedUser: any;
}

const ChatArea: React.FC<ChatAreaProps> = ({ selectedUser }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Cuộn xuống tin nhắn mới nhất khi tin nhắn thay đổi
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Cập nhật tin nhắn khi người dùng được chọn thay đổi
  useEffect(() => {
    if (selectedUser) {
      console.log(`📩 [ChatArea] Loading messages for user: ${selectedUser.id}`);
      // Lấy tin nhắn từ dữ liệu mẫu
      const userMessages = MOCK_MESSAGES[selectedUser.id] || [];
      setMessages(userMessages);
    } else {
      setMessages([]);
    }
  }, [selectedUser]);
  
  const handleSendMessage = () => {
    if ((!message.trim() && !selectedImage) || !selectedUser) return;
    
    console.log(`✉️ [ChatArea] Sending message to user: ${selectedUser.id}`, message, selectedImage ? 'with image' : '');
    
    // Tạo tin nhắn mới
    const newMessage = {
      id: Date.now().toString(),
      senderId: 'admin',
      text: message,
      timestamp: new Date().toISOString(),
      isAdmin: true,
      image: selectedImage
    };
    
    // Thêm tin nhắn mới vào danh sách
    setMessages(prevMessages => [...prevMessages, newMessage]);
    
    // Xóa nội dung tin nhắn và ảnh đã chọn
    setMessage('');
    setSelectedImage(null);
  };
  
  const handleImageUpload = (file) => {
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
          // Kích thước chuẩn sẽ được áp dụng trong component
        });
        
        setIsUploading(false);
      };
      img.src = imageUrl;
    };
    reader.readAsDataURL(file); // Đảm bảo đọc dưới dạng DataURL để có string
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
  
  return (
    <div className="flex flex-col w-2/3 h-full">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 bg-white flex items-center">
        <div className="relative">
          <Avatar className="h-10 w-10 border-2 border-white">
            <div className="flex h-full w-full items-center justify-center bg-green-100 text-green-800 font-medium">
              {selectedUser.fullName.charAt(0)}
            </div>
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
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
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
      </div>
      
      {/* Selected Image Preview */}
      {selectedImage && (
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
      
      {/* Message Input */}
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
    </div>
  );
};

export default ChatArea;