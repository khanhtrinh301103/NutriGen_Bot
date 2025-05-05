// src/api/adminAPI/postsManagementService.js

import axios from 'axios';

const FIREBASE_API_URL = process.env.NEXT_PUBLIC_FIREBASE_API_URL || "https://firestore.googleapis.com/v1";
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "nutrigen-bot";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://nutrigen-bot.onrender.com"; // Đảm bảo URL chính xác

// Base URL for Firestore REST API
const baseUrl = `${FIREBASE_API_URL}/projects/${PROJECT_ID}/databases/(default)/documents`;

export const fetchAllPosts = async () => {
  try {
    console.log('Fetching posts from Firestore...');
    const response = await axios.get(`${baseUrl}/posts`);
    console.log('Posts fetched:', response.data);
    
    if (!response.data.documents) {
      console.log('No posts found');
      return [];
    }

    // Transform Firestore documents to application data
    const posts = await Promise.all(response.data.documents.map(async (doc) => {
      const postId = doc.name.split('/').pop();
      
      // Convert Firestore values to normal JS objects
      const postData = {
        id: postId,
        caption: doc.fields?.caption?.stringValue || '',
        createdAt: doc.fields?.createdAt?.timestampValue || '',
        images: doc.fields?.images?.arrayValue?.values?.map(img => img.stringValue) || [],
        isDeleted: doc.fields?.isDeleted?.booleanValue || false,
        userId: doc.fields?.userId?.stringValue || '',
        userName: doc.fields?.userName?.stringValue || '',
        userAvatar: doc.fields?.userAvatar?.stringValue || '',
      };

      // Fetch comments count
      const commentsResponse = await axios.get(`${baseUrl}/posts/${postId}/comments`);
      const commentsCount = commentsResponse.data.documents ? commentsResponse.data.documents.length : 0;
      
      // Fetch likes count
      const likesResponse = await axios.get(`${baseUrl}/posts/${postId}/likes`);
      const likesCount = likesResponse.data.documents ? likesResponse.data.documents.length : 0;
      
      console.log(`Post ${postId} has ${commentsCount} comments and ${likesCount} likes`);
      
      return {
        ...postData,
        commentsCount,
        likesCount
      };
    }));
    
    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

export const hidePost = async (postId) => {
  try {
    console.log(`Hiding post ${postId}...`);
    
    // Prepare the update data
    const data = {
      fields: {
        isDeleted: {
          booleanValue: true
        }
      }
    };
    
    // Update the post using patch method
    await axios.patch(
      `${baseUrl}/posts/${postId}?updateMask.fieldPaths=isDeleted`,
      data
    );
    
    console.log(`Post ${postId} hidden successfully`);
    return true;
  } catch (error) {
    console.error(`Error hiding post ${postId}:`, error);
    throw error;
  }
};

export const deletePost = async (postId, imageUrls = [], userId = null) => {
  try {
    console.log(`Deleting post ${postId} and all related data...`);
    console.log(`User ID: ${userId}`);
    console.log(`Image URLs:`, imageUrls);
    
    // 1. Xóa tất cả comments
    console.log(`Deleting comments for post ${postId}...`);
    const commentsResponse = await axios.get(`${baseUrl}/posts/${postId}/comments`);
    if (commentsResponse.data.documents) {
      await Promise.all(commentsResponse.data.documents.map(async (doc) => {
        const commentId = doc.name.split('/').pop();
        await axios.delete(`${baseUrl}/posts/${postId}/comments/${commentId}`);
      }));
      console.log(`All comments deleted for post ${postId}`);
    }
    
    // 2. Xóa tất cả likes
    console.log(`Deleting likes for post ${postId}...`);
    const likesResponse = await axios.get(`${baseUrl}/posts/${postId}/likes`);
    if (likesResponse.data.documents) {
      await Promise.all(likesResponse.data.documents.map(async (doc) => {
        const likeId = doc.name.split('/').pop();
        await axios.delete(`${baseUrl}/posts/${postId}/likes/${likeId}`);
      }));
      console.log(`All likes deleted for post ${postId}`);
    }
    
    // 3. Xóa các file ảnh trong Storage
    if (imageUrls && imageUrls.length > 0) {
      try {
        console.log(`Requesting deletion of images...`);
        
        // Đảm bảo API URL hoàn chỉnh
        const deleteImagesUrl = `${API_URL}/api/delete-post-images`;
        console.log(`Sending request to: ${deleteImagesUrl}`);
        
        // Gửi thông tin chi tiết cho API xóa ảnh
        const deleteImagesResponse = await axios({
          method: 'post',
          url: deleteImagesUrl,
          data: { 
            imageUrls,
            postId,
            userId
          },
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000 // Tăng timeout lên 30 giây
        });
        
        console.log(`Images deletion response:`, deleteImagesResponse.data);
      } catch (storageError) {
        console.error('Could not delete images from storage:', storageError);
        console.error('Error response:', storageError.response?.data);
        console.error('Error message:', storageError.message);
        // Tiếp tục xóa bài viết ngay cả khi không thể xóa ảnh
      }
    }
    
    // 4. Cuối cùng, xóa document chính của bài viết
    await axios.delete(`${baseUrl}/posts/${postId}`);
    
    console.log(`Post ${postId} and all related data deleted successfully`);
    return true;
  } catch (error) {
    console.error(`Error deleting post ${postId}:`, error);
    throw error;
  }
};      

export const restorePost = async (postId) => {
  try {
    console.log(`Restoring post ${postId}...`);
    
    // Prepare the update data
    const data = {
      fields: {
        isDeleted: {
          booleanValue: false
        }
      }
    };
    
    // Update the post using patch method
    await axios.patch(
      `${baseUrl}/posts/${postId}?updateMask.fieldPaths=isDeleted`,
      data
    );
    
    console.log(`Post ${postId} restored successfully`);
    return true;
  } catch (error) {
    console.error(`Error restoring post ${postId}:`, error);
    throw error;
  }
};

// Thêm hàm này vào src/api/adminAPI/postsManagementService.js

export const deleteComment = async (postId, commentId) => {
  try {
    console.log(`Deleting comment ${commentId} from post ${postId}...`);
    
    // Delete the comment using Firebase REST API
    await axios.delete(`${baseUrl}/posts/${postId}/comments/${commentId}`);
    
    console.log(`Comment ${commentId} deleted successfully from post ${postId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting comment ${commentId} from post ${postId}:`, error);
    throw error;
  }
};