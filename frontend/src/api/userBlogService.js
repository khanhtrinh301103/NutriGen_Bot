/**
 * Soft delete a post (set isDeleted to true)
 * @param {string} postId - ID of the post to delete
 * @returns {Promise<boolean>} Success status
 */
export const deletePost = async (postId) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User must be logged in");
      }
  
      console.log(`Soft deleting post: ${postId}`);
      
      // Verify the user owns this post
      const postRef = doc(db, "posts", postId);
      const postSnap = await getDoc(postRef);
      
      if (!postSnap.exists()) {
        throw new Error("Post not found");
      }
      
      if (postSnap.data().userId !== currentUser.uid) {
        throw new Error("You don't have permission to delete this post");
      }
      
      // Soft delete by setting isDeleted flag
      await updateDoc(postRef, {
        isDeleted: true,
        updatedAt: serverTimestamp()
      });
      
      console.log(`Post ${postId} soft deleted successfully`);
      return true;
    } catch (error) {
      console.error(`Error deleting post ${postId}:`, error);
      throw error;
    }
  };
  
  /**
   * Update a post's caption or images
   * @param {string} postId - ID of the post to update
   * @param {Object} updatedData - New post data (caption, images)
   * @returns {Promise<boolean>} Success status
   */
  export const updatePost = async (postId, updatedData) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User must be logged in");
      }
  
      console.log(`Updating post: ${postId}`, updatedData);
      
      // Verify the user owns this post
      const postRef = doc(db, "posts", postId);
      const postSnap = await getDoc(postRef);
      
      if (!postSnap.exists()) {
        throw new Error("Post not found");
      }
      
      if (postSnap.data().userId !== currentUser.uid) {
        throw new Error("You don't have permission to update this post");
      }
      
      // Update the post
      const updateData = {
        updatedAt: serverTimestamp()
      };
      
      // Only update fields that are provided
      if (updatedData.caption !== undefined) {
        updateData.caption = updatedData.caption;
      }
      
      if (updatedData.images !== undefined) {
        updateData.images = updatedData.images;
      }
      
      await updateDoc(postRef, updateData);
      
      console.log(`Post ${postId} updated successfully`);
      return true;
    } catch (error) {
      console.error(`Error updating post ${postId}:`, error);
      throw error;
    }
  };// frontend/src/api/userBlogService.js
  import { collection, doc, getDoc, getDocs, updateDoc, addDoc, deleteDoc, query, where, orderBy, limit, serverTimestamp } from "firebase/firestore";
  import { db, auth } from "./firebaseConfig";
  
  /**
   * Get all posts created by the current user
   * @returns {Promise<Array>} Array of user's posts
   */
  export const getUserPosts = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User must be logged in");
      }
  
      console.log(`Fetching posts for user: ${currentUser.uid}`);
      
      // Fetch all posts
      const postsRef = collection(db, "posts");
      const postsSnapshot = await getDocs(postsRef);
      
      // Filter posts by userId on client-side to avoid composite index requirement
      const userPosts = [];
      
      for (const postDoc of postsSnapshot.docs) {
        const postData = postDoc.data();
        
        // Only include user's posts that are not deleted
        if (postData.userId === currentUser.uid && !postData.isDeleted) {
          // Get comments count
          const commentsRef = collection(db, "posts", postDoc.id, "comments");
          const commentsSnapshot = await getDocs(commentsRef);
          const commentsCount = commentsSnapshot.size;
          
          // Get likes count
          const likesRef = collection(db, "posts", postDoc.id, "likes");
          const likesSnapshot = await getDocs(likesRef);
          const likesCount = likesSnapshot.size;
          
          // Add post to array
          userPosts.push({
            id: postDoc.id,
            ...postData,
            commentsCount,
            likesCount,
            createdAt: postData.createdAt?.toDate().toISOString() || new Date().toISOString()
          });
        }
      }
      
      // Sort by createdAt desc
      userPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      console.log(`Retrieved ${userPosts.length} posts for user: ${currentUser.uid}`);
      return userPosts;
    } catch (error) {
      console.error("Error fetching user posts:", error);
      throw error;
    }
  };
  
  /**
   * Get all posts saved by the current user
   * @returns {Promise<Array>} Array of saved posts
   */
  export const getSavedPosts = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User must be logged in");
      }
  
      console.log(`Fetching saved posts for user: ${currentUser.uid}`);
      
      // Get user's saved post IDs
      const userRef = doc(db, "user", currentUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists() || !userSnap.data().savedPosts) {
        console.log("No saved posts found");
        return [];
      }
      
      const savedPostIds = userSnap.data().savedPosts || [];
      console.log(`Found ${savedPostIds.length} saved post IDs`);
      
      if (savedPostIds.length === 0) {
        return [];
      }
      
      // Fetch all posts
      const postsRef = collection(db, "posts");
      const postsSnapshot = await getDocs(postsRef);
      
      // Filter to only include saved posts that are not deleted
      const savedPosts = [];
      
      for (const postDoc of postsSnapshot.docs) {
        if (savedPostIds.includes(postDoc.id) && !postDoc.data().isDeleted) {
          const postData = postDoc.data();
          
          // Get comments count
          const commentsRef = collection(db, "posts", postDoc.id, "comments");
          const commentsSnapshot = await getDocs(commentsRef);
          const commentsCount = commentsSnapshot.size;
          
          // Get likes count and check if current user liked this post
          const likesRef = collection(db, "posts", postDoc.id, "likes");
          const likesSnapshot = await getDocs(likesRef);
          const likesCount = likesSnapshot.size;
          
          // Check if user has liked this post
          let liked = false;
          if (currentUser) {
            for (const likeDoc of likesSnapshot.docs) {
              if (likeDoc.data().userId === currentUser.uid) {
                liked = true;
                break;
              }
            }
          }
          
          savedPosts.push({
            id: postDoc.id,
            ...postData,
            commentsCount,
            likesCount,
            liked,
            saved: true,
            createdAt: postData.createdAt?.toDate().toISOString() || new Date().toISOString()
          });
        }
      }
      
      // Sort by newest first
      savedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      console.log(`Retrieved ${savedPosts.length} saved posts`);
      return savedPosts;
    } catch (error) {
      console.error("Error fetching saved posts:", error);
      throw error;
    }
  };
  
  /**
   * Get all posts liked by the current user
   * @returns {Promise<Array>} Array of liked posts with post details
   */
  export const getLikedPosts = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User must be logged in");
      }
  
      console.log(`Fetching liked posts for user: ${currentUser.uid}`);
      
      // Fetch all posts
      const postsRef = collection(db, "posts");
      const postsSnapshot = await getDocs(postsRef);
      
      // For each post, check if user has liked it
      const likedPosts = [];
      
      for (const postDoc of postsSnapshot.docs) {
        const postId = postDoc.id;
        const postData = postDoc.data();
        
        // Skip deleted posts
        if (postData.isDeleted) {
          continue;
        }
        
        // Check if user liked this post
        const likesRef = collection(db, "posts", postId, "likes");
        const likesSnapshot = await getDocs(likesRef);
        
        let userLikeData = null;
        let liked = false;
        
        for (const likeDoc of likesSnapshot.docs) {
          const likeData = likeDoc.data();
          if (likeData.userId === currentUser.uid) {
            userLikeData = {
              id: likeDoc.id,
              ...likeData,
              timestamp: likeData.timestamp?.toDate().toISOString() || new Date().toISOString()
            };
            liked = true;
            break;
          }
        }
        
        if (liked) {
          // Get comments count
          const commentsRef = collection(db, "posts", postId, "comments");
          const commentsSnapshot = await getDocs(commentsRef);
          const commentsCount = commentsSnapshot.size;
          
          // Add post to array with like details
          likedPosts.push({
            id: postId,
            ...postData,
            likedAt: userLikeData.timestamp,
            likesCount: likesSnapshot.size,
            commentsCount,
            liked: true,
            createdAt: postData.createdAt?.toDate().toISOString() || new Date().toISOString()
          });
        }
      }
      
      // Sort by liked time, most recent first
      likedPosts.sort((a, b) => new Date(b.likedAt) - new Date(a.likedAt));
      
      console.log(`Retrieved ${likedPosts.length} liked posts`);
      return likedPosts;
    } catch (error) {
      console.error("Error fetching liked posts:", error);
      throw error;
    }
  };
  
  /**
   * Get all posts commented on by the current user
   * @returns {Promise<Array>} Array of commented posts with comment details
   */
  export const getCommentedPosts = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User must be logged in");
      }
  
      console.log(`Fetching commented posts for user: ${currentUser.uid}`);
      
      // Fetch all posts
      const postsRef = collection(db, "posts");
      const postsSnapshot = await getDocs(postsRef);
      
      // For each post, check if user has commented on it
      const commentedPosts = [];
      
      for (const postDoc of postsSnapshot.docs) {
        const postId = postDoc.id;
        const postData = postDoc.data();
        
        // Skip deleted posts
        if (postData.isDeleted) {
          continue;
        }
        
        // Get all comments
        const commentsRef = collection(db, "posts", postId, "comments");
        const commentsSnapshot = await getDocs(commentsRef);
        
        // Filter to find user's comments
        const userComments = [];
        for (const commentDoc of commentsSnapshot.docs) {
          const commentData = commentDoc.data();
          if (commentData.userId === currentUser.uid) {
            userComments.push({
              id: commentDoc.id,
              ...commentData,
              timestamp: commentData.timestamp?.toDate().toISOString() || new Date().toISOString()
            });
          }
        }
        
        if (userComments.length > 0) {
          // Sort comments by timestamp, newest first
          userComments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          
          // Get likes count and check if user liked this post
          const likesRef = collection(db, "posts", postId, "likes");
          const likesSnapshot = await getDocs(likesRef);
          
          let liked = false;
          for (const likeDoc of likesSnapshot.docs) {
            if (likeDoc.data().userId === currentUser.uid) {
              liked = true;
              break;
            }
          }
          
          // Add post to array with comments
          commentedPosts.push({
            id: postId,
            ...postData,
            comments: userComments,
            lastCommentAt: userComments[0].timestamp,
            commentsCount: commentsSnapshot.size,
            likesCount: likesSnapshot.size,
            liked,
            createdAt: postData.createdAt?.toDate().toISOString() || new Date().toISOString()
          });
        }
      }
      
      // Sort by most recent comment
      commentedPosts.sort((a, b) => new Date(b.lastCommentAt) - new Date(a.lastCommentAt));
      
      console.log(`Retrieved ${commentedPosts.length} commented posts`);
      return commentedPosts;
    } catch (error) {
      console.error("Error fetching commented posts:", error);
      throw error;
    }
  };