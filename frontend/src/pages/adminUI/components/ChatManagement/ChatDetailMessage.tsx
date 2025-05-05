// frontend/src/pages/adminUI/components/chatManagement/ChatDetailMessage.tsx
import React from 'react';
import { Avatar } from '@/components/ui/avatar';
import { format } from 'date-fns';

interface ChatDetailMessageProps {
  message: {
    id: string;
    senderId: string;
    text: string;
    timestamp: Date;
    isAdmin: boolean;
    imageUrl?: string | null; // Thêm thuộc tính imageUrl
  };
  userName: string;
}

const ChatDetailMessage: React.FC<ChatDetailMessageProps> = ({ message, userName }) => {
  return (
    <div className={`flex ${message.isAdmin ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[75%] ${message.isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${message.isAdmin ? 'ml-3' : 'mr-3'}`}>
          <Avatar className="h-8 w-8">
            <div className={`flex h-full w-full items-center justify-center ${
              message.isAdmin 
                ? 'bg-green-100 text-green-800' 
                : 'bg-blue-100 text-blue-800'
            } font-medium`}>
              {message.isAdmin ? 'A' : userName.charAt(0)}
            </div>
          </Avatar>
        </div>

        {/* Message Bubble */}
        <div className="flex flex-col">
          <div className={`px-4 py-2 rounded-lg ${
            message.isAdmin 
              ? 'bg-green-500 text-white rounded-tr-none' 
              : 'bg-white text-gray-900 border border-gray-200 rounded-tl-none'
          }`}>
            {/* Hiển thị hình ảnh nếu có */}
            {message.imageUrl && (
              <div className="mb-2">
                <img 
                  src={message.imageUrl} 
                  alt="Chat image" 
                  className="rounded max-w-full max-h-[200px] object-contain"
                  onError={(e) => {
                    console.error('❌ [ChatDetailMessage] Error loading image:', message.imageUrl);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            {/* Hiển thị văn bản tin nhắn nếu có */}
            {message.text && <p className="whitespace-pre-wrap break-words">{message.text}</p>}
            {/* Hiển thị thông báo nếu không có văn bản và cũng không có hình ảnh */}
            {!message.text && !message.imageUrl && (
              <p className="italic text-gray-500">Empty message</p>
            )}
          </div>
          <span className={`text-xs text-gray-500 mt-1 ${message.isAdmin ? 'text-right' : 'text-left'}`}>
            {format(message.timestamp, 'h:mm a')}
          </span>
        </div>
      </div>
    </div>
  );
};


export const getServerSideProps = async (context) => {
  return {
    props: {}, // Will be passed to the page component as props
  }
};

export default ChatDetailMessage;