// frontend/src/pages/adminUI/components/AdminChat/ChatArea.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { Tooltip } from '@/components/ui/tooltip';
import { TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';
import ChatMessage from './ChatMessage';
import EmptyChatState from './EmptyChatState';
import ImageUploader from './ImageUploader';
import { 
  getChatMessages, 
  sendAdminMessage, 
  uploadAdminChatImage, 
  getChatDetails,
  releaseChat,
  closeChat,
  acceptChat
} from '../../../../api/adminAPI/adminChatService';
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
  const [assignedAdmin, setAssignedAdmin] = useState(null);
  const [isAssignedToMe, setIsAssignedToMe] = useState(false);
  const [showReleaseDialog, setShowReleaseDialog] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
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
          setError(null);
          
          // Lấy thông tin chi tiết của chat
          const chatDetails = await getChatDetails(selectedUser.id);
          
          // Cập nhật trạng thái chat
          setChatStatus(chatDetails.status || 'active');
          setAssignedAdmin(chatDetails.assignedAdmin || null);
          
          // Kiểm tra xem chat có được phân công cho admin hiện tại không
          setIsAssignedToMe(chatDetails.assignedAdmin === user?.uid);
          
          console.log(`🔍 [ChatArea] Chat status: ${chatDetails.status}, Assigned to: ${chatDetails.assignedAdmin || 'none'}`);
          
          setIsLoading(false);
        } catch (err) {
          console.error(`❌ [ChatArea] Error fetching chat details:`, err);
          setError(`Could not load chat details: ${err.message}`);
          setIsLoading(false);
        }
      }
    };

    fetchChatDetails();
  }, [selectedUser, user]);
  
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
    
    // Kiểm tra quyền admin - chỉ admin được phân công mới được gửi tin nhắn
    if (!assignedAdmin) {
      console.error(`❌ [ChatArea] Cannot send message to an unassigned chat`);
      setError(`You need to accept this chat before sending messages`);
      return;
    }
    
    if (assignedAdmin !== user?.uid) {
      console.error(`❌ [ChatArea] Cannot send message to a chat assigned to another admin`);
      setError(`This chat is assigned to another admin`);
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
      await sendAdminMessage(selectedUser.id, adminMessage, user?.uid);
      
      console.log(`✉️ [ChatArea] Sent admin message to user: ${selectedUser.id}`);
      
      // Xóa nội dung tin nhắn và ảnh đã chọn
      setMessage('');
      setSelectedImage(null);
    } catch (err) {
      console.error(`❌ [ChatArea] Error sending message:`, err);
      setError(`Failed to send message: ${err.message}`);
    }
  };
  
  // Xử lý chấp nhận chat trong khu vực chat
  const handleAcceptChat = async () => {
    if (!selectedUser || !user?.uid || !user?.displayName) return;
    
    setActionLoading(true);
    try {
      console.log(`🔄 [ChatArea] Accepting chat: ${selectedUser.id}`);
      await acceptChat(selectedUser.id, user.uid, user.displayName || 'Admin');
      console.log(`✅ [ChatArea] Chat accepted: ${selectedUser.id}`);
    } catch (err) {
      console.error(`❌ [ChatArea] Error accepting chat:`, err);
      setError(`Failed to accept chat: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleImageUpload = (file) => {
    // Kiểm tra trạng thái chat
    if (chatStatus !== 'active') {
      console.error(`❌ [ChatArea] Cannot upload image to a ${chatStatus} chat`);
      setError(`Cannot upload image to a ${chatStatus} chat`);
      return;
    }
    
    // Kiểm tra quyền admin
    if (!assignedAdmin) {
      console.error(`❌ [ChatArea] Cannot upload image to an unassigned chat`);
      setError(`You need to accept this chat before uploading images`);
      return;
    }
    
    if (assignedAdmin !== user?.uid) {
      console.error(`❌ [ChatArea] Cannot upload image to a chat assigned to another admin`);
      setError(`This chat is assigned to another admin`);
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
  
  // Xử lý từ bỏ chat
  const handleReleaseChat = async () => {
    if (!selectedUser || !user?.uid || !user?.displayName) return;
    
    setActionLoading(true);
    try {
      console.log(`🔄 [ChatArea] Releasing chat: ${selectedUser.id}`);
      await releaseChat(selectedUser.id, user.uid, user.displayName || 'Admin');
      setShowReleaseDialog(false);
      console.log(`✅ [ChatArea] Chat released: ${selectedUser.id}`);
    } catch (err) {
      console.error(`❌ [ChatArea] Error releasing chat:`, err);
      setError(`Failed to release chat: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };
  
  // Xử lý đóng chat
  const handleCloseChat = async () => {
    if (!selectedUser || !user?.uid || !user?.displayName) return;
    
    setActionLoading(true);
    try {
      console.log(`🔄 [ChatArea] Closing chat: ${selectedUser.id}`);
      await closeChat(selectedUser.id, user.uid, user.displayName || 'Admin');
      setShowCloseDialog(false);
      console.log(`✅ [ChatArea] Chat closed: ${selectedUser.id}`);
    } catch (err) {
      console.error(`❌ [ChatArea] Error closing chat:`, err);
      setError(`Failed to close chat: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };
  
  // Nếu không có người dùng nào được chọn
  if (!selectedUser) {
    return <EmptyChatState />;
  }
  
  // Hiển thị thông báo chat đã đóng
  const isChatClosed = chatStatus !== 'active';
  const canSendMessage = chatStatus === 'active' && assignedAdmin === user?.uid;
  
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
            <div className="flex items-center">
              <p className="font-medium">{selectedUser.fullName}</p>
              {selectedUser.topic && (
                <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700">
                  {selectedUser.topic}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500">{selectedUser.email}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Hiển thị trạng thái chat */}
          <Badge 
            variant="outline" 
            className={isChatClosed 
              ? 'bg-gray-100 text-gray-800 hover:bg-gray-100' 
              : 'bg-green-100 text-green-800 hover:bg-green-100'
            }
          >
            {chatStatus === 'active' ? 'Active' : chatStatus === 'closed' ? 'Closed' : 'Archived'}
          </Badge>
          
          {/* Hiển thị trạng thái phân công */}
          {assignedAdmin && (
            <Badge 
              variant="outline" 
              className={isAssignedToMe 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-amber-100 text-amber-800'
              }
            >
              {isAssignedToMe ? 'Assigned to Me' : 'Assigned to Others'}
            </Badge>
          )}
          
          {/* Nút Accept Chat cho admin khi chat chưa được phân công */}
          {!assignedAdmin && chatStatus === 'active' && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="default" 
                    size="sm"
                    className="h-9 bg-green-600 hover:bg-green-700"
                    onClick={handleAcceptChat}
                  >
                    Accept Chat
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Accept this conversation to respond</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {/* Hiển thị các nút hành động */}
          {isAssignedToMe && chatStatus === 'active' && (
            <div className="flex space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-9 border-amber-300 text-amber-700 hover:bg-amber-50"
                      onClick={() => setShowReleaseDialog(true)}
                    >
                      Release
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Release this chat for other admins</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-9 border-gray-300 text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowCloseDialog(true)}
                    >
                      Close Chat
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>End this conversation</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
          
          {/* Nút đóng chat cho chat không có người phân công */}
          {!assignedAdmin && chatStatus === 'active' && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-9 border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowCloseDialog(true)}
                  >
                    Close Chat
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>End this conversation</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
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
      
      {/* Thông báo không thể nhắn tin - chat đã đóng hoặc được giao cho admin khác hoặc chưa accept */}
      {!canSendMessage && (
        <div className="border-t border-gray-200 p-4 bg-gray-100 text-center">
          <div className="inline-flex items-center text-gray-700 bg-gray-50 rounded-full px-4 py-2 border">
            {isChatClosed ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>This conversation is {chatStatus} and cannot be continued</span>
              </>
            ) : assignedAdmin && assignedAdmin !== user?.uid ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>This conversation is assigned to another admin</span>
              </>
            ) : !assignedAdmin ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>You need to accept this conversation before responding</span>
              </>
            ) : null}
          </div>
        </div>
      )}
      
      {/* Selected Image Preview */}
      {selectedImage && canSendMessage && (
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
      
      {/* Message Input - chỉ hiển thị nếu có thể gửi tin nhắn */}
      {canSendMessage && (
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
      
      {/* Release Chat Dialog */}
      <Dialog open={showReleaseDialog} onOpenChange={setShowReleaseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              Release Conversation
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to release this conversation? 
              It will be available for other admins to accept.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowReleaseDialog(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="default"
              className="bg-amber-600 hover:bg-amber-700"
              onClick={handleReleaseChat}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : "Release"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Close Chat Dialog */}
      <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              Close Conversation
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to close this conversation? 
              The user will not be able to continue this chat.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCloseDialog(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleCloseChat}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : "Close Conversation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};


export const getServerSideProps = async (context) => {
  return {
    props: {}, // Will be passed to the page component as props
  }
};

export default ChatArea;