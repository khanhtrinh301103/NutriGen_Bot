import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../api/useAuth';
import { initializeChat, sendMessage, getChatMessages, uploadChatImage, getUserActiveChat, initializeAnonymousChat } from '../../../api/chatService';

// Thêm prop để truyền vào
interface ChatPopupProps {
  isAnonymous?: boolean;
  anonymousIssue?: string; // Vấn đề của người dùng ẩn danh (ví dụ: "Account suspended")
  onClose?: () => void; // Callback khi đóng popup
}

const ChatPopup: React.FC<ChatPopupProps> = ({ isAnonymous = false, anonymousIssue = '', onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ id?: string; text: string; isUser: boolean; imageUrl?: string; timestamp?: Date }[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [chatId, setChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingSubmit, setIsProcessingSubmit] = useState(false);
  const [checkedForActiveChat, setCheckedForActiveChat] = useState(false);
  const [anonymousName, setAnonymousName] = useState<string>('');
  const [anonymousEmail, setAnonymousEmail] = useState<string>('');
  const [showAnonymousForm, setShowAnonymousForm] = useState<boolean>(isAnonymous);
  
  // Khi component được tạo với isAnonymous = true, tự động mở popup
  useEffect(() => {
    if (isAnonymous) {
      setIsOpen(true);
      setShowAnonymousForm(true);
    }
  }, [isAnonymous]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    console.log("🔄 [Chat] Chat popup toggled:", !isOpen);
    
    // Nếu mở popup và đã đăng nhập nhưng chưa check active chat
    if (!isOpen && user && !chatId && !checkedForActiveChat) {
      checkForActiveChat();
    }
    
    // Nếu đóng chat và có hàm callback onClose
    if (isOpen && onClose) {
      onClose();
    }
  };
  
  // Kiểm tra xem người dùng đã có chat đang hoạt động chưa
  const checkForActiveChat = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("🔄 [Chat] Checking for active chat");
      const activeChatId = await getUserActiveChat(user.uid);
      
      if (activeChatId) {
        console.log("✅ [Chat] Found active chat:", activeChatId);
        setChatId(activeChatId);
      } else {
        console.log("ℹ️ [Chat] No active chat found");
      }
      
      setCheckedForActiveChat(true);
      setIsLoading(false);
    } catch (err) {
      console.error("❌ [Chat] Error checking for active chat:", err);
      setError("Could not check active chats. Please try again later.");
      setIsLoading(false);
    }
  };
  
  // Initialize chat session
  const initializeChatSession = async () => {
    if (!user && !isAnonymous) return null;
    
    try {
      setIsLoading(true);
      setError(null);
      
      let chatSessionId = null;
      
      if (isAnonymous) {
        // Tạo chat ẩn danh
        if (!anonymousName || !anonymousEmail) {
          setError("Please provide your name and email to continue.");
          setIsLoading(false);
          return null;
        }
        
        const issue = anonymousIssue || 'Account Issue';
        chatSessionId = await initializeAnonymousChat(anonymousName, anonymousEmail, issue);
      } else {
        // Tạo chat thông thường
        const chatSession = await initializeChat(user.uid);
        chatSessionId = chatSession.id;
      }
      
      console.log("✅ [Chat] Chat session initialized:", chatSessionId);
      return chatSessionId;
    } catch (err) {
      console.error("❌ [Chat] Error initializing chat:", err);
      setError("Could not initialize chat. Please try again later.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Xử lý form thông tin người dùng ẩn danh
    if (isAnonymous && showAnonymousForm) {
      if (!anonymousName || !anonymousEmail) {
        setError("Please provide your name and email to continue.");
        return;
      }
      
      setShowAnonymousForm(false);
      
      // Thêm thông báo tự động về vấn đề của người dùng
      if (anonymousIssue) {
        setInputMessage(`Hello, I'm having an issue with my account: ${anonymousIssue}. Can you help me?`);
      }
      
      return;
    }
    
    if ((!user && !isAnonymous) || (inputMessage.trim() === '' && !previewUrl)) {
      return;
    }
    
    // Xử lý tin nhắn không trống hoặc có ảnh
    if ((inputMessage.trim() !== '' || previewUrl) && !isProcessingSubmit) {
      setIsProcessingSubmit(true);
      
      try {
        // Nếu chưa có chatId, khởi tạo một phiên chat mới
        let currentChatId = chatId;
        if (!currentChatId) {
          setIsLoading(true);
          currentChatId = await initializeChatSession();
          if (!currentChatId) {
            throw new Error("Failed to initialize chat session");
          }
          setChatId(currentChatId);
          console.log("✅ [Chat] New chat session created on first message:", currentChatId);
        }
        
        let imageUrl = undefined;
        
        // Upload image if selected
        if (selectedImage) {
          // Xử lý tải ảnh lên khi chat ẩn danh
          const userIdentifier = user ? user.uid : 'anonymous';
          imageUrl = await uploadChatImage(selectedImage, currentChatId, userIdentifier);
        }
        
        // Create message object
        const newMessage = {
          text: inputMessage.trim(),
          isUser: true,
          imageUrl: imageUrl || null,
          senderId: user ? user.uid : 'anonymous',
          senderName: user ? (user.displayName || user.email || "User") : (anonymousName || "Anonymous User"),
          senderRole: 'user'
        };
        
        // Add message to Firestore
        await sendMessage(currentChatId, newMessage);
        
        // Reset input states
        setInputMessage('');
        setSelectedImage(null);
        setPreviewUrl(null);
        
        console.log("✉️ [Chat] Message sent successfully");
      } catch (err) {
        console.error("❌ [Chat] Error sending message:", err);
        setError("Failed to send message. Please try again.");
      } finally {
        setIsProcessingSubmit(false);
        setIsLoading(false);
      }
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      // Tạo URL preview cho ảnh
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      console.log("🖼️ [Chat] Image selected:", file.name);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    console.log("🗑️ [Chat] Selected image removed");
  };

  // Load chat messages when chatId changes
  useEffect(() => {
    if (!chatId) return;
    
    console.log(`🔄 [Chat] Setting up message listener for chat: ${chatId}`);
    
    const unsubscribe = getChatMessages(chatId, (chatMessages) => {
      setMessages(chatMessages);
    });
    
    // Cleanup listener on unmount
    return () => {
      console.log(`🔄 [Chat] Cleaning up message listener for chat: ${chatId}`);
      unsubscribe();
    };
  }, [chatId]);
  
  // Kiểm tra active chat khi người dùng đăng nhập
  useEffect(() => {
    if (user && !chatId && !checkedForActiveChat && !isAnonymous) {
      checkForActiveChat();
    }
  }, [user, chatId, checkedForActiveChat, isAnonymous]);

  // Scroll to bottom khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="fixed bottom-16 right-4 sm:bottom-5 sm:right-5 z-50">
      {/* Chat popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-lg shadow-xl w-[320px] sm:w-[350px] overflow-hidden mb-3 max-h-[500px] flex flex-col"
          >
            {/* Header */}
            <div className="bg-green-600 text-white px-4 py-3 flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 16a5 5 0 0010 0c0-.34-.035-.67-.102-.986A5.001 5.001 0 0010 11z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="font-semibold">NutriGen Support</h3>
              </div>
              <button 
                onClick={toggleChat}
                className="text-white hover:text-green-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            {/* Anonymous User Form */}
            {isAnonymous && showAnonymousForm ? (
              <div className="p-4">
                <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        {anonymousIssue 
                          ? `You're contacting us about: ${anonymousIssue}` 
                          : 'Please provide your information to start chatting with our support team'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="anonymousName" className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      id="anonymousName"
                      value={anonymousName}
                      onChange={(e) => setAnonymousName(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="anonymousEmail" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      id="anonymousEmail"
                      value={anonymousEmail}
                      onChange={(e) => setAnonymousEmail(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      placeholder="Your email address"
                      required
                    />
                  </div>
                  
                  <button
                    onClick={handleSubmit}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Start Chat
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Chat messages */}
                <div className="flex-1 overflow-y-auto p-4 min-h-[250px] max-h-[350px]">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                      <p className="mt-2 text-gray-500">Loading chat...</p>
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
                    messages.map((msg, index) => (
                      <div 
                        key={msg.id || index} 
                        className={`mb-3 max-w-[80%] ${msg.isUser ? 'ml-auto' : 'mr-auto'}`}
                      >
                        <div 
                          className={`rounded-lg p-3 ${
                            msg.isUser 
                              ? 'bg-green-600 text-white rounded-br-none' 
                              : 'bg-gray-200 text-gray-800 rounded-bl-none'
                          }`}
                        >
                          {msg.imageUrl && (
                            <div className="mb-2">
                              <img 
                                src={msg.imageUrl} 
                                alt="Shared image" 
                                className="rounded max-w-full max-h-[150px] object-contain"
                              />
                            </div>
                          )}
                          {msg.text && <p>{msg.text}</p>}
                          {msg.timestamp && (
                            <p className={`text-xs mt-1 text-right ${msg.isUser ? 'text-green-200' : 'text-gray-500'}`}>
                              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Input area */}
                <form onSubmit={handleSubmit} className="border-t border-gray-200 p-3">
                  {previewUrl && (
                    <div className="relative mb-2 inline-block">
                      <img 
                        src={previewUrl} 
                        alt="Selected preview" 
                        className="h-16 w-auto rounded border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={removeSelectedImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-gray-500 hover:text-green-600 mr-2"
                      disabled={isLoading}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={isLoading || isProcessingSubmit || (inputMessage.trim() === '' && !previewUrl)}
                      className={`ml-2 p-2 rounded-full ${
                        isLoading || (inputMessage.trim() === '' && !previewUrl) || isProcessingSubmit
                          ? 'bg-gray-300 text-gray-500'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {isProcessingSubmit ? (
                        <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </div>
                  
                  {/* Not signed in message (hiển thị khi không phải là ẩn danh và user chưa đăng nhập) */}
                  {!user && !isAnonymous && (
                    <p className="text-center text-xs text-red-500 mt-2">
                      Please sign in to use the chat support
                    </p>
                  )}
                </form>
              </>
            )}
            
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat toggle button (chỉ hiển thị khi không phải là chat ẩn danh từ trang login) */}
      {!isAnonymous && (
        <motion.button
          onClick={toggleChat}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-green-600 text-white rounded-full p-3 shadow-lg flex items-center justify-center"
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
          )}
        </motion.button>
      )}
    </div>
  );
};

export default ChatPopup;