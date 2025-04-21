// frontend/src/api/adminAPI/adminChatService.js
import { db } from '../firebaseConfig';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  getDocs,
  Timestamp,
  getDoc
} from 'firebase/firestore';

// Lấy danh sách tất cả các cuộc trò chuyện
export const getAllChats = (callback) => {
  try {
    console.log("🔄 [AdminChat] Getting all chats");
    
    const chatsRef = collection(db, 'chats');
    // Sắp xếp theo thời gian cập nhật mới nhất
    const q = query(chatsRef, orderBy('updatedAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chats = [];
      
      // Xử lý từng document chat
      for (const chatDoc of snapshot.docs) {
        const chatData = chatDoc.data();
        
        // Lấy thông tin người dùng từ collection user
        let userData = null;
        try {
          const userDoc = await getDoc(doc(db, 'user', chatData.userId));
          userData = userDoc.exists() ? userDoc.data() : null;
        } catch (error) {
          console.error(`❌ [AdminChat] Error getting user data for ID: ${chatData.userId}`, error);
        }
        
        // Format dữ liệu để hiển thị
        chats.push({
          id: chatDoc.id,
          userId: chatData.userId,
          fullName: userData?.fullName || 'Unknown User',
          email: userData?.email || '',
          lastMessage: chatData.lastMessage?.text || 'No messages yet',
          timestamp: chatData.updatedAt ? new Date(chatData.updatedAt.toDate()).toISOString() : new Date().toISOString(),
          unread: 0, // Tính năng đọc/chưa đọc sẽ được phát triển sau
          online: false, // Tính năng trạng thái online sẽ được phát triển sau
          avatarUrl: userData?.photoURL || null,
          status: chatData.status
        });
      }
      
      console.log(`✅ [AdminChat] Retrieved ${chats.length} chats`);
      callback(chats);
    }, (error) => {
      console.error("❌ [AdminChat] Error getting chats:", error);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error("❌ [AdminChat] Error setting up chats listener:", error);
    throw error;
  }
};

// Lấy tin nhắn cho một cuộc trò chuyện cụ thể
export const getChatMessages = (chatId, callback) => {
  try {
    console.log(`🔄 [AdminChat] Getting messages for chat: ${chatId}`);
    
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Convert timestamp
        let timestamp;
        try {
          timestamp = data.timestamp?.toDate().toISOString() || new Date().toISOString();
        } catch (err) {
          timestamp = new Date().toISOString();
        }
        
        messages.push({
          id: doc.id,
          senderId: data.senderId || '',
          text: data.text || '',
          timestamp: timestamp,
          isAdmin: data.senderRole === 'admin',
          imageUrl: data.imageUrl || null
        });
      });
      
      console.log(`✅ [AdminChat] Retrieved ${messages.length} messages for chat: ${chatId}`);
      callback(messages);
    }, (error) => {
      console.error(`❌ [AdminChat] Error getting messages for chat: ${chatId}`, error);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error("❌ [AdminChat] Error setting up message listener:", error);
    throw error;
  }
};

// Thêm hàm này vào file để lấy thông tin chi tiết về chat
export const getChatDetails = async (chatId) => {
  try {
    console.log(`🔄 [AdminChat] Getting chat details for: ${chatId}`);
    
    const chatDoc = await getDoc(doc(db, 'chats', chatId));
    
    if (!chatDoc.exists()) {
      throw new Error(`Chat with ID ${chatId} not found`);
    }
    
    const chatData = chatDoc.data();
    
    // Lấy thông tin người dùng
    let userData = null;
    try {
      const userDoc = await getDoc(doc(db, 'user', chatData.userId));
      userData = userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error(`❌ [AdminChat] Error getting user data: ${error}`);
    }
    
    // Chuyển đổi timestamp sang Date
    const startDate = chatData.createdAt ? chatData.createdAt.toDate() : new Date();
    const lastMessageDate = chatData.updatedAt ? chatData.updatedAt.toDate() : startDate;
    
    const chatDetails = {
      id: chatDoc.id,
      userId: chatData.userId,
      status: chatData.status || 'active',
      createdAt: startDate,
      updatedAt: lastMessageDate,
      userDetails: userData
    };
    
    console.log(`✅ [AdminChat] Retrieved details for chat: ${chatId}`);
    return chatDetails;
  } catch (error) {
    console.error(`❌ [AdminChat] Error getting chat details: ${error}`);
    throw error;
  }
};

// Sửa hàm sendAdminMessage để kiểm tra trạng thái chat trước khi gửi
export const sendAdminMessage = async (chatId, message) => {
  try {
    console.log(`🔄 [AdminChat] Sending admin message to chat ${chatId}:`, message);
    
    // Kiểm tra trạng thái chat trước khi gửi
    const chatDoc = await getDoc(doc(db, 'chats', chatId));
    if (!chatDoc.exists()) {
      throw new Error(`Chat with ID ${chatId} not found`);
    }
    
    const chatData = chatDoc.data();
    if (chatData.status !== 'active') {
      throw new Error(`Cannot send message to a ${chatData.status} chat`);
    }
    
    // Create basic message object
    const messageToSave = {
      text: message.text || "",
      isUser: false,
      imageUrl: message.imageUrl || null,
      senderId: message.senderId || "admin",
      senderName: message.senderName || "Admin",
      senderRole: "admin"
    };
    
    // Add message to messages subcollection
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const messageRef = await addDoc(messagesRef, messageToSave);
    
    // Add timestamp in separate step to avoid undefined issues
    const now = Timestamp.now();
    await updateDoc(doc(db, 'chats', chatId, 'messages', messageRef.id), {
      timestamp: now
    });
    
    // Update chat's lastMessage and updatedAt
    await updateDoc(doc(db, 'chats', chatId), {
      lastMessage: {
        text: message.text || "",
        timestamp: now
      },
      updatedAt: now
    });
    
    console.log("✅ [AdminChat] Admin message sent successfully:", messageRef.id);
    
    return messageRef.id;
  } catch (error) {
    console.error("❌ [AdminChat] Error sending admin message:", error);
    throw error;
  }
};
// Upload hình ảnh chat từ admin
export const uploadAdminChatImage = async (file, chatId, adminId) => {
  try {
    console.log(`🔄 [AdminChat] Uploading admin image for chat ${chatId}`);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("uid", adminId || "admin");
    formData.append("chatId", chatId);

    const response = await fetch("http://localhost:5000/api/uploadChatPhoto", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const data = await response.json();
    console.log("✅ [AdminChat] Uploaded admin chat image:", data.imageUrl);
    
    return data.imageUrl;
  } catch (error) {
    console.error("❌ [AdminChat] Error uploading admin chat image:", error);
    throw error;
  }
};

// Thêm hàm để ẩn/lưu trữ một cuộc trò chuyện
export const archiveChat = async (chatId) => {
  try {
    console.log(`🔄 [AdminChat] Archiving chat: ${chatId}`);
    
    await updateDoc(doc(db, 'chats', chatId), {
      status: 'archived',
      updatedAt: Timestamp.now()
    });
    
    console.log(`✅ [AdminChat] Archived chat: ${chatId}`);
    return true;
  } catch (error) {
    console.error(`❌ [AdminChat] Error archiving chat: ${error}`);
    throw error;
  }
};

// Thêm hàm để khôi phục một cuộc trò chuyện đã ẩn
export const restoreChat = async (chatId) => {
  try {
    console.log(`🔄 [AdminChat] Restoring chat: ${chatId}`);
    
    await updateDoc(doc(db, 'chats', chatId), {
      status: 'closed', // Khôi phục về trạng thái đóng
      updatedAt: Timestamp.now()
    });
    
    console.log(`✅ [AdminChat] Restored chat: ${chatId}`);
    return true;
  } catch (error) {
    console.error(`❌ [AdminChat] Error restoring chat: ${error}`);
    throw error;
  }
};