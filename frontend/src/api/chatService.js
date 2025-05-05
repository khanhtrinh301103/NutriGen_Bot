// frontend/src/api/chatService.js
import { db } from './firebaseConfig';
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  getDocs,
  Timestamp 
} from 'firebase/firestore';

// Create a new chat session or get existing one
export const initializeChat = async (userId) => {
  try {
    console.log("🔄 [Chat] Initializing chat for user:", userId);
    
    // Check if the user already has an active chat
    const userChatsRef = collection(db, 'chats');
    const q = query(
      userChatsRef,
      where('userId', '==', userId),
      where('status', '==', 'active')
    );
    
    const querySnapshot = await getDocs(q);
    
    // If an active chat exists, return it
    if (!querySnapshot.empty) {
      const chatDoc = querySnapshot.docs[0];
      console.log("✅ [Chat] Found existing chat:", chatDoc.id);
      return { id: chatDoc.id, ...chatDoc.data() };
    }
    
    // If no active chat, create a new one
    // First, get all admins (users with role='admin')
    const usersRef = collection(db, 'user');
    const adminQuery = query(usersRef, where('role', '==', 'admin'));
    const adminSnapshot = await getDocs(adminQuery);
    
    let adminIds = [];
    adminSnapshot.forEach(doc => {
      adminIds.push(doc.id);
    });
    
    if (adminIds.length === 0) {
      console.log("⚠️ [Chat] No admin users found");
    }
    
    const now = Timestamp.now();
    
    // Create new chat document
    const newChatRef = await addDoc(collection(db, 'chats'), {
      userId,
      createdAt: now,
      updatedAt: now,
      status: 'active',
      admins: adminIds,
      lastMessage: null
    });
    
    console.log("✅ [Chat] Created new chat:", newChatRef.id);
    
    return { 
      id: newChatRef.id, 
      userId,
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
      status: 'active',
      admins: adminIds,
      lastMessage: null
    };
  } catch (error) {
    console.error("❌ [Chat] Error initializing chat:", error);
    throw error;
  }
};

// Send a message - phiên bản sửa lỗi
export const sendMessage = async (chatId, messageData) => {
  try {
    console.log(`🔄 [Chat] Sending message to chat ${chatId}:`, messageData);
    
    // Tạo bản sao của messageData, không thay đổi input gốc
    const message = { ...messageData };
    
    // Tạo một message document KHÔNG chứa timestamp
    // Sẽ không còn lỗi "undefined timestamp"
    const messageToSave = {
      text: message.text || "",
      isUser: message.isUser === false ? false : true,
      imageUrl: message.imageUrl || null,
      senderId: message.senderId || "",
      senderName: message.senderName || "",
      senderRole: message.senderRole || "user"
    };
    
    console.log("📦 [Chat] Message data to save:", messageToSave);
    
    // Add message to messages subcollection
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const messageRef = await addDoc(messagesRef, messageToSave);
    
    // Sau khi lưu thành công, cập nhật thêm timestamp
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
    
    console.log("✅ [Chat] Message sent successfully:", messageRef.id);
    
    return messageRef.id;
  } catch (error) {
    console.error("❌ [Chat] Error sending message:", error);
    throw error;
  }
};

// Get message history
export const getChatMessages = (chatId, callback) => {
  try {
    console.log(`🔄 [Chat] Getting messages for chat: ${chatId}`);
    
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    // Set up real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Safely convert Firestore timestamp to JS Date
        let timestamp;
        try {
          timestamp = data.timestamp?.toDate() || new Date();
        } catch (err) {
          console.log("⚠️ [Chat] Error converting timestamp:", err);
          timestamp = new Date();
        }
        
        messages.push({
          id: doc.id,
          ...data,
          timestamp
        });
      });
      
      console.log(`✅ [Chat] Retrieved ${messages.length} messages`);
      callback(messages);
    }, (error) => {
      console.error("❌ [Chat] Error getting messages:", error);
    });
    
    // Return unsubscribe function to stop listening when needed
    return unsubscribe;
  } catch (error) {
    console.error("❌ [Chat] Error setting up message listener:", error);
    throw error;
  }
};

// Upload chat image
export const uploadChatImage = async (file, chatId, userId) => {
  try {
    console.log(`🔄 [Chat] Uploading image for chat ${chatId}`);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("uid", userId);
    formData.append("chatId", chatId);

    const response = await fetch("https://nutrigen-bot.onrender.com/api/uploadChatPhoto", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const data = await response.json();
    console.log("✅ [Chat] Uploaded chat image:", data.imageUrl);
    
    return data.imageUrl;
  } catch (error) {
    console.error("❌ [Chat] Error uploading chat image:", error);
    throw error;
  }
};

// Thêm hàm mới để lấy chat đang hoạt động của người dùng
export const getUserActiveChat = async (userId) => {
  try {
    console.log("🔄 [Chat] Getting user's active chat:", userId);
    
    // Tìm kiếm chat có trạng thái 'active' của người dùng
    const userChatsRef = collection(db, 'chats');
    const q = query(
      userChatsRef,
      where('userId', '==', userId),
      where('status', '==', 'active')
    );
    
    const querySnapshot = await getDocs(q);
    
    // Nếu tìm thấy chat active, trả về ID của chat đó
    if (!querySnapshot.empty) {
      const chatDoc = querySnapshot.docs[0];
      console.log("✅ [Chat] Found active chat:", chatDoc.id);
      return chatDoc.id;
    }
    
    // Nếu không tìm thấy, trả về null
    console.log("ℹ️ [Chat] No active chat found for user:", userId);
    return null;
  } catch (error) {
    console.error("❌ [Chat] Error getting active chat:", error);
    throw error;
  }
};

// Tạo một chat mới cho người dùng ẩn danh
export const initializeAnonymousChat = async (name, email, issue) => {
  try {
    console.log("🔄 [Chat] Initializing anonymous chat for:", name, email);
    
    // Lấy tất cả admin
    const usersRef = collection(db, 'user');
    const adminQuery = query(usersRef, where('role', '==', 'admin'));
    const adminSnapshot = await getDocs(adminQuery);
    
    let adminIds = [];
    adminSnapshot.forEach(doc => {
      adminIds.push(doc.id);
    });
    
    if (adminIds.length === 0) {
      console.log("⚠️ [Chat] No admin users found");
    }
    
    const now = Timestamp.now();
    
    // Tạo metadata cho người dùng ẩn danh
    const anonymousUser = {
      name: name,
      email: email,
      issue: issue
    };
    
    // Tạo document chat mới
    const newChatRef = await addDoc(collection(db, 'chats'), {
      userId: 'anonymous',  // Sử dụng ID đặc biệt cho người dùng ẩn danh
      anonymousUser: anonymousUser,  // Thêm thông tin người dùng ẩn danh
      createdAt: now,
      updatedAt: now,
      status: 'active',
      admins: adminIds,
      lastMessage: null,
      topic: `Anonymous Chat - ${issue}`  // Đặt chủ đề để admin dễ nhận biết
    });
    
    console.log("✅ [Chat] Created new anonymous chat:", newChatRef.id);
    
    // Thêm tin nhắn hệ thống để thông báo về người dùng ẩn danh
    const systemMessage = {
      text: `Anonymous user ${name} (${email}) has started a chat regarding: ${issue}`,
      isUser: false,
      senderId: 'system',
      senderName: 'System',
      senderRole: 'system'
    };
    
    await sendMessage(newChatRef.id, systemMessage);
    
    return newChatRef.id;
  } catch (error) {
    console.error("❌ [Chat] Error initializing anonymous chat:", error);
    throw error;
  }
};