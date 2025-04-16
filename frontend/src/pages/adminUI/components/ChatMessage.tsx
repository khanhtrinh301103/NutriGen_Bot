// frontend/src/pages/adminUI/components/chat/ChatMessage.tsx
import React, { useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { format } from 'date-fns';

interface ChatMessageProps {
  message: {
    id: string;
    senderId: string;
    text: string;
    timestamp: string;
    isAdmin: boolean;
    image?: {
      src: string;
      originalWidth: number;
      originalHeight: number;
    };
  };
  user: any;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, user }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  
  // Format timestamp để hiển thị
  const formatTime = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'h:mm a');
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return '';
    }
  };

  const isAdmin = message.isAdmin;
  
  // Xử lý kích thước ảnh để hiển thị thống nhất
  const getImageDimensions = () => {
    if (!message.image) return { width: 0, height: 0 };
    
    const MAX_WIDTH = 240; // Chiều rộng tối đa trong khung chat
    const MAX_HEIGHT = 180; // Chiều cao tối đa trong khung chat
    
    const { originalWidth, originalHeight } = message.image;
    
    // Tính toán tỷ lệ khung hình
    const aspectRatio = originalWidth / originalHeight;
    
    // Tính toán kích thước phù hợp trong giới hạn
    let width, height;
    
    if (aspectRatio > 1) { // Ảnh ngang
      width = Math.min(MAX_WIDTH, originalWidth);
      height = width / aspectRatio;
      
      if (height > MAX_HEIGHT) {
        height = MAX_HEIGHT;
        width = height * aspectRatio;
      }
    } else { // Ảnh dọc
      height = Math.min(MAX_HEIGHT, originalHeight);
      width = height * aspectRatio;
      
      if (width > MAX_WIDTH) {
        width = MAX_WIDTH;
        height = width / aspectRatio;
      }
    }
    
    return { width, height };
  };
  
  return (
    <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[80%] ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isAdmin ? 'ml-3' : 'mr-3'}`}>
          <Avatar className="h-8 w-8">
            <div className={`flex h-full w-full items-center justify-center ${
              isAdmin 
                ? 'bg-green-100 text-green-800' 
                : 'bg-blue-100 text-blue-800'
            } font-medium`}>
              {isAdmin ? 'A' : user.fullName.charAt(0)}
            </div>
          </Avatar>
        </div>

        {/* Message Bubble */}
        <div className="flex flex-col">
          <div className={`px-4 py-2 rounded-lg ${
            isAdmin 
              ? 'bg-green-500 text-white rounded-tr-none' 
              : 'bg-white text-gray-900 border border-gray-200 rounded-tl-none'
          }`}>
            {message.text && (
              <p className="whitespace-pre-wrap break-words mb-2">{message.text}</p>
            )}
            
            {message.image && (
              <div className="mt-1">
                <div 
                  className={`relative overflow-hidden rounded-md ${!message.text ? 'mt-0' : 'mt-2'}`}
                  style={{ opacity: imageLoaded ? 1 : 0.5 }}
                >
                  <img
                    src={message.image.src}
                    alt="Message attachment"
                    className={`cursor-pointer object-cover ${imageLoaded ? '' : 'blur-sm'}`}
                    style={getImageDimensions()}
                    onClick={() => setIsImageModalOpen(true)}
                    onLoad={() => {
                      console.log(`🖼️ [ChatMessage] Image loaded in message: ${message.id}`);
                      setImageLoaded(true);
                    }}
                  />
                  
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="animate-spin h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <span className={`text-xs text-gray-500 mt-1 ${isAdmin ? 'text-right' : 'text-left'}`}>
            {formatTime(message.timestamp)}
          </span>
          
          {/* Modal hiển thị ảnh đầy đủ khi click */}
          {isImageModalOpen && message.image && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
              onClick={() => setIsImageModalOpen(false)}
            >
              <div className="relative max-w-4xl max-h-screen p-4">
                <img
                  src={message.image.src}
                  alt="Full size image"
                  className="max-w-full max-h-[80vh] object-contain"
                />
                <button
                  className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsImageModalOpen(false);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;