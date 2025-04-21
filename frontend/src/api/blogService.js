// frontend/src/api/blogService.js
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, query, where, orderBy, increment, arrayUnion, arrayRemove, serverTimestamp, Timestamp } from "firebase/firestore";
import { db, auth } from "./firebaseConfig";

/**
 * Get all blog posts from Firestore
 * @returns {Promise<Array>} Array of blog posts
 */
export const getAllPosts = async () => {
    try {
      console.log("Fetching all blog posts from Firestore");
      const postsRef = collection(db, "posts");
      
      // Sử dụng truy vấn đơn giản không cần composite index
      const q = query(postsRef, where("isDeleted", "==", false));
      
      const querySnapshot = await getDocs(q);
      const posts = [];
      
      querySnapshot.forEach((doc) => {
        posts.push({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore Timestamp to ISO string
          createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
        });
      });
      
      // Sắp xếp trên client thay vì trong database
      posts.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // Sắp xếp giảm dần (mới nhất trước)
      });
      
      console.log(`Retrieved ${posts.length} blog posts`);
      return posts;
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      throw error;
    }
  };

/**
 * Get a single blog post by ID
 * @param {string} postId - The post ID
 * @returns {Promise<Object>} Post object
 */
export const getPostById = async (postId) => {
  try {
    console.log(`Fetching post with ID: ${postId}`);
    const postRef = doc(db, "posts", postId);
    const postSnap = await getDoc(postRef);
    
    if (postSnap.exists()) {
      const postData = postSnap.data();
      return {
        id: postSnap.id,
        ...postData,
        createdAt: postData.createdAt?.toDate().toISOString() || new Date().toISOString()
      };
    } else {
      console.log(`Post with ID ${postId} not found`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching post ${postId}:`, error);
    throw error;
  }
};

/**
 * Get comments for a specific post
 * @param {string} postId - The post ID
 * @returns {Promise<Array>} Array of comments
 */
export const getPostComments = async (postId) => {
  try {
    console.log(`Fetching comments for post: ${postId}`);
    const commentsRef = collection(db, "posts", postId, "comments");
    const q = query(commentsRef, orderBy("timestamp", "asc"));
    
    const querySnapshot = await getDocs(q);
    const comments = [];
    
    querySnapshot.forEach((doc) => {
      comments.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate().toISOString() || new Date().toISOString()
      });
    });
    
    console.log(`Retrieved ${comments.length} comments for post ${postId}`);
    return comments;
  } catch (error) {
    console.error(`Error fetching comments for post ${postId}:`, error);
    throw error;
  }
};

/**
 * Create a new post in Firestore
 * @param {Object} postData - Post data with caption and imageUrls
 * @returns {Promise<string>} New post ID
 */
export const createPost = async (postData) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User must be logged in to create a post");
    }
    
    console.log("Creating new blog post:", postData);
    
    const newPost = {
      userId: currentUser.uid,
      userName: currentUser.displayName || "Anonymous User",
      userAvatar: currentUser.photoURL || null,
      caption: postData.caption,
      images: postData.images,
      likes: 0,
      comments: [],
      saved: false,
      isDeleted: false,
      likesCount: 0,
      commentsCount: 0,
      createdAt: serverTimestamp()
    };
    
    const postsRef = collection(db, "posts");
    const docRef = await addDoc(postsRef, newPost);
    
    console.log(`New post created with ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

/**
 * Add a comment to a post
 * @param {string} postId - The post ID
 * @param {string} commentText - The comment text
 * @returns {Promise<string>} New comment ID
 */
export const addComment = async (postId, commentText) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User must be logged in to comment");
    }
    
    console.log(`Adding comment to post ${postId}: ${commentText}`);
    
    const newComment = {
      userId: currentUser.uid,
      userName: currentUser.displayName || "Anonymous User",
      text: commentText,
      timestamp: serverTimestamp()
    };
    
    // Add the comment to the comments subcollection
    const commentsRef = collection(db, "posts", postId, "comments");
    const commentRef = await addDoc(commentsRef, newComment);
    
    // Update the comment count in the post document
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      commentsCount: increment(1)
    });
    
    console.log(`Comment added with ID: ${commentRef.id}`);
    return commentRef.id;
  } catch (error) {
    console.error(`Error adding comment to post ${postId}:`, error);
    throw error;
  }
};

/**
 * Like or unlike a post
 * @param {string} postId - The post ID
 * @returns {Promise<boolean>} True if post was liked, False if unliked
 */
export const toggleLikePost = async (postId) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User must be logged in to like posts");
    }
    
    console.log(`Toggling like for post: ${postId}`);
    
    // Get user's liked posts reference
    const userLikesRef = doc(db, "user", currentUser.uid);
    const userLikesSnap = await getDoc(userLikesRef);
    
    // Get the post reference to update like count
    const postRef = doc(db, "posts", postId);
    
    // Check if post was already liked
    let userLikes = [];
    if (userLikesSnap.exists() && userLikesSnap.data().likedPosts) {
      userLikes = userLikesSnap.data().likedPosts;
    }
    
    const alreadyLiked = userLikes.includes(postId);
    
    if (alreadyLiked) {
      // Unlike the post
      console.log(`Unliking post: ${postId}`);
      await updateDoc(userLikesRef, {
        likedPosts: arrayRemove(postId)
      });
      
      await updateDoc(postRef, {
        likesCount: increment(-1)
      });
      
      return false; // Unliked
    } else {
      // Like the post
      console.log(`Liking post: ${postId}`);
      await updateDoc(userLikesRef, {
        likedPosts: arrayUnion(postId)
      });
      
      await updateDoc(postRef, {
        likesCount: increment(1)
      });
      
      return true; // Liked
    }
  } catch (error) {
    console.error(`Error toggling like for post ${postId}:`, error);
    throw error;
  }
};

/**
 * Save or unsave a post
 * @param {string} postId - The post ID
 * @returns {Promise<boolean>} True if post was saved, False if unsaved
 */
export const toggleSavePost = async (postId) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User must be logged in to save posts");
    }
    
    console.log(`Toggling save for post: ${postId}`);
    
    // Get user's saved posts reference
    const userRef = doc(db, "user", currentUser.uid);
    const userSnap = await getDoc(userRef);
    
    // Check if post was already saved
    let savedPosts = [];
    if (userSnap.exists() && userSnap.data().savedPosts) {
      savedPosts = userSnap.data().savedPosts;
    }
    
    const alreadySaved = savedPosts.includes(postId);
    
    if (alreadySaved) {
      // Unsave the post
      console.log(`Unsaving post: ${postId}`);
      await updateDoc(userRef, {
        savedPosts: arrayRemove(postId)
      });
      return false; // Unsaved
    } else {
      // Save the post
      console.log(`Saving post: ${postId}`);
      await updateDoc(userRef, {
        savedPosts: arrayUnion(postId)
      });
      return true; // Saved
    }
  } catch (error) {
    console.error(`Error toggling save for post ${postId}:`, error);
    throw error;
  }
};

/**
 * Check if user has liked a post
 * @param {string} postId - The post ID
 * @returns {Promise<boolean>} True if post is liked by user
 */
export const isPostLiked = async (postId) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return false;
    }
    
    const userLikesRef = doc(db, "user", currentUser.uid);
    const userLikesSnap = await getDoc(userLikesRef);
    
    if (userLikesSnap.exists() && userLikesSnap.data().likedPosts) {
      return userLikesSnap.data().likedPosts.includes(postId);
    }
    
    return false;
  } catch (error) {
    console.error(`Error checking if post ${postId} is liked:`, error);
    return false;
  }
};

/**
 * Check if user has saved a post
 * @param {string} postId - The post ID
 * @returns {Promise<boolean>} True if post is saved by user
 */
export const isPostSaved = async (postId) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return false;
    }
    
    const userRef = doc(db, "user", currentUser.uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists() && userSnap.data().savedPosts) {
      return userSnap.data().savedPosts.includes(postId);
    }
    
    return false;
  } catch (error) {
    console.error(`Error checking if post ${postId} is saved:`, error);
    return false;
  }
};

/**
 * Upload post images to backend API
 * @param {File[]} files - Array of image files
 * @returns {Promise<string[]>} Array of image URLs
 */
export const uploadPostImages = async (files) => {
    try {
      console.log(`🔄 [Blog] Uploading ${files.length} images`);
      
      // Create FormData object to send files
      const formData = new FormData();
      
      // Append all files to the FormData
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
        console.log(`🔄 [Blog] Added file ${i+1}: ${files[i].name} (${files[i].size} bytes)`);
      }
      
      // Append user ID if user is logged in
      const currentUser = auth.currentUser;
      if (currentUser) {
        formData.append('userId', currentUser.uid);
        console.log(`🔄 [Blog] Uploading as user: ${currentUser.uid}`);
      } else {
        console.log(`🔄 [Blog] Uploading as anonymous user`);
      }
      
      // Gửi trực tiếp đến Express backend
      console.log(`🔄 [Blog] Sending request directly to Express backend: http://localhost:5000/api/upload-post-image`);
      const response = await fetch('http://localhost:5000/api/upload-post-image', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`❌ [Blog] Upload failed with status ${response.status}:`, errorData);
        throw new Error(errorData.error || 'Failed to upload images');
      }
      
      const data = await response.json();
      console.log(`✅ [Blog] Images uploaded successfully:`, data.imageUrls);
      
      return data.imageUrls;
    } catch (error) {
      console.error('❌ [Blog] Error uploading post images:', error);
      throw error;
    }
  };