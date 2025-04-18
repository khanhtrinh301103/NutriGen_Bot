// frontend/src/api/adminAPI/adminChatManagementService.js
import { db } from '../firebaseConfig';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  updateDoc,
  deleteDoc,
  Timestamp,
  startAfter,
  endBefore,
  limitToLast,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';

// Lấy danh sách tất cả các cuộc trò chuyện cho quản lý
export const getAllChatsForManagement = async () => {
  try {
    console.log("🔄 [AdminChatManagement] Getting all chats for management");
    
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, orderBy('updatedAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    const chats = [];
    
    // Lấy dữ liệu chat và thông tin người dùng
    for (const chatDoc of querySnapshot.docs) {
      const chatData = chatDoc.data();
      
      // Lấy thông tin chi tiết người dùng
      let userData = null;
      try {
        const userDoc = await getDoc(doc(db, 'user', chatData.userId));
        userData = userDoc.exists() ? userDoc.data() : null;
      } catch (error) {
        console.error(`❌ [AdminChatManagement] Error getting user data: ${error}`);
      }
      
      // Lấy số tin nhắn trong chat
      let messagesCount = 0;
      try {
        const messagesRef = collection(db, 'chats', chatDoc.id, 'messages');
        const messagesQuery = query(messagesRef);
        const messagesSnapshot = await getDocs(messagesQuery);
        messagesCount = messagesSnapshot.size;
      } catch (error) {
        console.error(`❌ [AdminChatManagement] Error counting messages: ${error}`);
      }
      
      // Chuyển đổi timestamp sang Date
      const startDate = chatData.createdAt ? chatData.createdAt.toDate() : new Date();
      const lastMessageDate = chatData.updatedAt ? chatData.updatedAt.toDate() : startDate;
      
      chats.push({
        id: chatDoc.id,
        userId: chatData.userId,
        userName: userData?.fullName || 'Unknown User',
        userEmail: userData?.email || '',
        startDate: startDate,
        lastMessageDate: lastMessageDate,
        messagesCount: messagesCount,
        status: chatData.status || 'closed',
        topic: chatData.topic || 'General Support'
      });
    }
    
    console.log(`✅ [AdminChatManagement] Retrieved ${chats.length} chats for management`);
    return chats;
  } catch (error) {
    console.error("❌ [AdminChatManagement] Error getting chats:", error);
    throw error;
  }
};

// Lấy thông tin chi tiết của một cuộc trò chuyện
export const getChatDetails = async (chatId) => {
  try {
    console.log(`🔄 [AdminChatManagement] Getting details for chat: ${chatId}`);
    
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
      console.error(`❌ [AdminChatManagement] Error getting user data: ${error}`);
    }
    
    // Lấy số tin nhắn trong chat
    let messagesCount = 0;
    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const messagesQuery = query(messagesRef);
      const messagesSnapshot = await getDocs(messagesQuery);
      messagesCount = messagesSnapshot.size;
    } catch (error) {
      console.error(`❌ [AdminChatManagement] Error counting messages: ${error}`);
    }
    
    // Lấy tin nhắn trong chat
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));
    const messagesSnapshot = await getDocs(messagesQuery);
    
    const messages = messagesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        senderId: data.senderId,
        text: data.text || '',
        timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
        isAdmin: data.senderRole === 'admin',
        imageUrl: data.imageUrl || null
      };
    });
    
    // Chuyển đổi timestamp sang Date
    const startDate = chatData.createdAt ? chatData.createdAt.toDate() : new Date();
    const lastMessageDate = chatData.updatedAt ? chatData.updatedAt.toDate() : startDate;
    
    const chatDetails = {
      id: chatDoc.id,
      userId: chatData.userId,
      userName: userData?.fullName || 'Unknown User',
      userEmail: userData?.email || '',
      startDate: startDate,
      lastMessageDate: lastMessageDate,
      messagesCount: messagesCount,
      status: chatData.status || 'closed',
      topic: chatData.topic || 'General Support',
      messages: messages,
      userDetails: userData || null
    };
    
    console.log(`✅ [AdminChatManagement] Retrieved details for chat: ${chatId}`);
    return chatDetails;
  } catch (error) {
    console.error(`❌ [AdminChatManagement] Error getting chat details: ${error}`);
    throw error;
  }
};

// Cập nhật trạng thái của cuộc trò chuyện
export const updateChatStatus = async (chatId, status) => {
  try {
    console.log(`🔄 [AdminChatManagement] Updating status for chat ${chatId} to ${status}`);
    
    await updateDoc(doc(db, 'chats', chatId), {
      status: status,
      updatedAt: serverTimestamp()
    });
    
    console.log(`✅ [AdminChatManagement] Updated status for chat: ${chatId}`);
    return true;
  } catch (error) {
    console.error(`❌ [AdminChatManagement] Error updating chat status: ${error}`);
    throw error;
  }
};

// Xóa một cuộc trò chuyện (hoặc đánh dấu đã xóa)
export const deleteChat = async (chatId) => {
  try {
    console.log(`🔄 [AdminChatManagement] Deleting chat: ${chatId}`);
    
    // Phương pháp 1: Xóa hoàn toàn (cẩn thận)
    // await deleteDoc(doc(db, 'chats', chatId));
    
    // Phương pháp 2: Đánh dấu đã xóa (an toàn hơn)
    await updateDoc(doc(db, 'chats', chatId), {
      status: 'deleted',
      updatedAt: serverTimestamp()
    });
    
    console.log(`✅ [AdminChatManagement] Deleted chat: ${chatId}`);
    return true;
  } catch (error) {
    console.error(`❌ [AdminChatManagement] Error deleting chat: ${error}`);
    throw error;
  }
};

// Lấy thống kê chat
export const getChatAnalytics = async () => {
  try {
    console.log("🔄 [AdminChatManagement] Getting chat analytics");
    
    const chatsRef = collection(db, 'chats');
    const chatsSnapshot = await getDocs(chatsRef);
    
    // Đếm số lượng chat theo trạng thái
    let totalChats = 0;
    let activeChats = 0;
    let closedChats = 0;
    let totalMessages = 0;
    
    // Xử lý từng chat để thu thập thống kê
    for (const chatDoc of chatsSnapshot.docs) {
      const chatData = chatDoc.data();
      totalChats++;
      
      if (chatData.status === 'active') {
        activeChats++;
      } else if (chatData.status === 'closed') {
        closedChats++;
      }
      
      // Đếm số tin nhắn
      try {
        const messagesRef = collection(db, 'chats', chatDoc.id, 'messages');
        const messagesSnapshot = await getDocs(messagesRef);
        totalMessages += messagesSnapshot.size;
      } catch (error) {
        console.error(`❌ [AdminChatManagement] Error counting messages: ${error}`);
      }
    }
    
    // Tính trung bình tin nhắn mỗi chat
    const avgMessagesPerChat = totalChats > 0 ? Math.round(totalMessages / totalChats) : 0;
    
    const analytics = {
      totalChats,
      activeChats,
      closedChats,
      totalMessages,
      avgMessagesPerChat
    };
    
    console.log("✅ [AdminChatManagement] Retrieved chat analytics");
    return analytics;
  } catch (error) {
    console.error("❌ [AdminChatManagement] Error getting chat analytics:", error);
    throw error;
  }
};

// Xuất dữ liệu chat
export const exportChatData = async (chatId) => {
  try {
    console.log(`🔄 [AdminChatManagement] Exporting data for chat: ${chatId}`);
    
    // Lấy thông tin chat và tin nhắn
    const chatDetails = await getChatDetails(chatId);
    
    // Định dạng dữ liệu xuất
    const exportData = {
      chatInfo: {
        id: chatDetails.id,
        userId: chatDetails.userId,
        userName: chatDetails.userName,
        userEmail: chatDetails.userEmail,
        startDate: chatDetails.startDate.toISOString(),
        lastMessageDate: chatDetails.lastMessageDate.toISOString(),
        status: chatDetails.status,
        topic: chatDetails.topic,
        messagesCount: chatDetails.messagesCount
      },
      messages: chatDetails.messages.map(msg => ({
        id: msg.id,
        senderId: msg.senderId,
        senderType: msg.isAdmin ? 'admin' : 'user',
        text: msg.text,
        timestamp: msg.timestamp.toISOString(),
        imageUrl: msg.imageUrl
      }))
    };
    
    console.log(`✅ [AdminChatManagement] Exported data for chat: ${chatId}`);
    return exportData;
  } catch (error) {
    console.error(`❌ [AdminChatManagement] Error exporting chat data: ${error}`);
    throw error;
  }
};