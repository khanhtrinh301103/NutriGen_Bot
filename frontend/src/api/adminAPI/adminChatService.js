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
  getDoc,
  serverTimestamp
} from 'firebase/firestore';

// Lấy danh sách tất cả các cuộc trò chuyện
export const getAllChats = (callback, currentAdminId = null) => {
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
        
        // Xác định xem admin hiện tại có phải là người được phân công không
        const isAssigned = chatData.assignedAdmin === currentAdminId;
        
        // Xác định trạng thái chat có thể tiếp nhận hay không
        const canAccept = !chatData.assignedAdmin && chatData.status === 'active';
        
        // Format dữ liệu để hiển thị
        chats.push({
          id: chatDoc.id,
          userId: chatData.userId,
          fullName: userData?.fullName || chatData.anonymousUser?.name || 'Unknown User',
          email: userData?.email || chatData.anonymousUser?.email || '',
          lastMessage: chatData.lastMessage?.text || 'No messages yet',
          timestamp: chatData.updatedAt ? new Date(chatData.updatedAt.toDate()).toISOString() : new Date().toISOString(),
          unread: 0, // Tính năng đọc/chưa đọc sẽ được phát triển sau
          online: false, // Tính năng trạng thái online sẽ được phát triển sau
          avatarUrl: userData?.photoURL || null,
          status: chatData.status,
          topic: chatData.topic || 'General Support',
          assignedAdmin: chatData.assignedAdmin || null,
          isAssigned: isAssigned,
          canAccept: canAccept
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

// Lấy thông tin chi tiết về chat
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
      if (chatData.userId !== 'anonymous') {
        const userDoc = await getDoc(doc(db, 'user', chatData.userId));
        userData = userDoc.exists() ? userDoc.data() : null;
      } else if (chatData.anonymousUser) {
        userData = {
          fullName: chatData.anonymousUser.name || 'Anonymous User',
          email: chatData.anonymousUser.email || '',
        };
      }
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
      userDetails: userData,
      topic: chatData.topic || 'General Support',
      assignedAdmin: chatData.assignedAdmin || null
    };
    
    console.log(`✅ [AdminChat] Retrieved details for chat: ${chatId}`);
    return chatDetails;
  } catch (error) {
    console.error(`❌ [AdminChat] Error getting chat details: ${error}`);
    throw error;
  }
};

// Gửi tin nhắn admin sau khi kiểm tra quyền hạn
export const sendAdminMessage = async (chatId, message, currentAdminId) => {
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
    
    // Kiểm tra nghiêm ngặt: Chỉ admin được phân công mới được gửi tin nhắn
    if (!chatData.assignedAdmin) {
      throw new Error(`You need to accept this chat before sending messages`);
    }
    
    if (chatData.assignedAdmin !== currentAdminId) {
      throw new Error(`This chat is assigned to another admin`);
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

// Lưu trữ một cuộc trò chuyện
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

// Khôi phục một cuộc trò chuyện đã lưu trữ
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

// Admin chấp nhận trò chuyện
export const acceptChat = async (chatId, adminId, adminName) => {
  try {
    console.log(`🔄 [AdminChat] Admin ${adminId} accepting chat: ${chatId}`);
    
    // Kiểm tra xem chat đã được phân công chưa
    const chatDoc = await getDoc(doc(db, 'chats', chatId));
    if (!chatDoc.exists()) {
      throw new Error(`Chat with ID ${chatId} not found`);
    }
    
    const chatData = chatDoc.data();
    if (chatData.assignedAdmin) {
      throw new Error(`This chat is already assigned to another admin`);
    }
    
    if (chatData.status !== 'active') {
      throw new Error(`Cannot accept a ${chatData.status} chat`);
    }
    
    // Cập nhật trạng thái phân công
    await updateDoc(doc(db, 'chats', chatId), {
      assignedAdmin: adminId,
      updatedAt: Timestamp.now()
    });
    
    // Tạo tin nhắn hệ thống thông báo admin đã tiếp nhận
    const systemMessage = {
      text: `Admin ${adminName} has accepted this conversation.`,
      senderId: 'system',
      senderName: 'System',
      senderRole: 'system',
      isUser: false,
      timestamp: Timestamp.now()
    };
    
    await addDoc(collection(db, 'chats', chatId, 'messages'), systemMessage);
    
    console.log(`✅ [AdminChat] Admin ${adminId} successfully accepted chat: ${chatId}`);
    return true;
  } catch (error) {
    console.error(`❌ [AdminChat] Error accepting chat: ${error}`);
    throw error;
  }
};

// Admin từ bỏ trò chuyện
export const releaseChat = async (chatId, adminId, adminName) => {
  try {
    console.log(`🔄 [AdminChat] Admin ${adminId} releasing chat: ${chatId}`);
    
    // Kiểm tra quyền admin
    const chatDoc = await getDoc(doc(db, 'chats', chatId));
    if (!chatDoc.exists()) {
      throw new Error(`Chat with ID ${chatId} not found`);
    }
    
    const chatData = chatDoc.data();
    if (chatData.assignedAdmin !== adminId) {
      throw new Error(`You do not have permission to release this chat`);
    }
    
    // Cập nhật trạng thái phân công
    await updateDoc(doc(db, 'chats', chatId), {
      assignedAdmin: null,
      updatedAt: Timestamp.now()
    });
    
    // Tạo tin nhắn hệ thống thông báo admin đã từ bỏ
    const systemMessage = {
      text: `Admin ${adminName} has released this conversation. Waiting for another admin to accept.`,
      senderId: 'system',
      senderName: 'System',
      senderRole: 'system',
      isUser: false,
      timestamp: Timestamp.now()
    };
    
    await addDoc(collection(db, 'chats', chatId, 'messages'), systemMessage);
    
    console.log(`✅ [AdminChat] Admin ${adminId} successfully released chat: ${chatId}`);
    return true;
  } catch (error) {
    console.error(`❌ [AdminChat] Error releasing chat: ${error}`);
    throw error;
  }
};

// Đóng chat (kết thúc cuộc trò chuyện)
export const closeChat = async (chatId, adminId, adminName) => {
  try {
    console.log(`🔄 [AdminChat] Admin ${adminId} closing chat: ${chatId}`);
    
    // Kiểm tra quyền admin
    const chatDoc = await getDoc(doc(db, 'chats', chatId));
    if (!chatDoc.exists()) {
      throw new Error(`Chat with ID ${chatId} not found`);
    }
    
    const chatData = chatDoc.data();
    if (chatData.assignedAdmin && chatData.assignedAdmin !== adminId) {
      throw new Error(`You do not have permission to close this chat`);
    }
    
    // Cập nhật trạng thái phân công
    await updateDoc(doc(db, 'chats', chatId), {
      status: 'closed',
      updatedAt: Timestamp.now()
    });
    
    // Tạo tin nhắn hệ thống thông báo đóng chat
    const systemMessage = {
      text: `Admin ${adminName} has closed this conversation.`,
      senderId: 'system',
      senderName: 'System',
      senderRole: 'system',
      isUser: false,
      timestamp: Timestamp.now()
    };
    
    await addDoc(collection(db, 'chats', chatId, 'messages'), systemMessage);
    
    console.log(`✅ [AdminChat] Admin ${adminId} successfully closed chat: ${chatId}`);
    return true;
  } catch (error) {
    console.error(`❌ [AdminChat] Error closing chat: ${error}`);
    throw error;
  }
};