// backend/functions/getUserPosts.js
const express = require('express');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, orderBy, getDocs, doc, getDoc } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyDqw21EVpn50Zat-m2GZwU-b8-3skl4dOE",
    authDomain: "nutrigen-bot-dd79d.firebaseapp.com",
    projectId: "nutrigen-bot-dd79d",
    storageBucket: "nutrigen-bot-dd79d.appspot.com",
    messagingSenderId: "159253848647",
    appId: "1:159253848647:web:03153e86e4744253078762",
    measurementId: "G-4ZHJC8C4S4"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const router = express.Router();

// Helper function to convert timestamps to ISO strings
const convertTimestamps = (data) => {
    // Deep copy to avoid modifying original
    const newData = JSON.parse(JSON.stringify(data));
    
    // Convert top-level timestamps
    if (newData.createdAt && newData.createdAt._seconds) {
        newData.createdAt = new Date(newData.createdAt._seconds * 1000).toISOString();
    }
    if (newData.updatedAt && newData.updatedAt._seconds) {
        newData.updatedAt = new Date(newData.updatedAt._seconds * 1000).toISOString();
    }
    
    return newData;
};

// Route to get user posts
router.get('/user-posts', async (req, res) => {
    console.log('🔄 [Express] Received request to get user posts');
    
    try {
        // Get user ID from query parameter
        const userId = req.query.userId;
        if (!userId) {
            console.error('❌ [Express] No user ID provided');
            return res.status(400).json({ error: 'User ID is required' });
        }
        
        console.log(`🔄 [Express] Getting posts for user: ${userId}`);
        
        // Get posts from Firestore without composite index
        const postsRef = collection(db, "posts");
        const postsSnapshot = await getDocs(postsRef);
        
        // Filter posts manually
        const userPosts = [];
        postsSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.userId === userId && data.isDeleted !== true) {
                userPosts.push({
                    id: doc.id,
                    ...convertTimestamps(data)
                });
            }
        });
        
        // Sort by created date (newest first)
        userPosts.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
        });
        
        console.log(`✅ [Express] Found ${userPosts.length} posts for user ${userId}`);
        res.status(200).json({ posts: userPosts });
    } catch (error) {
        console.error('❌ [Express] Error getting user posts:', error);
        res.status(500).json({ error: 'Failed to get user posts', details: error.message });
    }
});

// Route to get user liked posts
router.get('/user-liked-posts', async (req, res) => {
    console.log('🔄 [Express] Received request to get user liked posts');
    
    try {
        // Get user ID from query parameter
        const userId = req.query.userId;
        if (!userId) {
            console.error('❌ [Express] No user ID provided');
            return res.status(400).json({ error: 'User ID is required' });
        }
        
        console.log(`🔄 [Express] Getting liked posts for user: ${userId}`);
        
        // Get all posts
        const postsRef = collection(db, "posts");
        const postsSnapshot = await getDocs(postsRef);
        
        const likedPosts = [];
        
        // For each post, check if user has liked it
        for (const postDoc of postsSnapshot.docs) {
            const postId = postDoc.id;
            const postData = postDoc.data();
            
            // Skip deleted posts
            if (postData.isDeleted) continue;
            
            // Get likes for this post
            const likesRef = collection(db, "posts", postId, "likes");
            const likesSnapshot = await getDocs(likesRef);
            
            // Check if user liked this post
            let userLike = null;
            likesSnapshot.forEach(likeDoc => {
                const likeData = likeDoc.data();
                if (likeData.userId === userId) {
                    userLike = {
                        id: likeDoc.id,
                        ...convertTimestamps(likeData)
                    };
                }
            });
            
            if (userLike) {
                likedPosts.push({
                    id: postId,
                    ...convertTimestamps(postData),
                    likedAt: userLike.timestamp || new Date().toISOString()
                });
            }
        }
        
        // Sort by like date (newest first)
        likedPosts.sort((a, b) => {
            return new Date(b.likedAt).getTime() - new Date(a.likedAt).getTime();
        });
        
        console.log(`✅ [Express] Found ${likedPosts.length} liked posts for user ${userId}`);
        res.status(200).json({ posts: likedPosts });
    } catch (error) {
        console.error('❌ [Express] Error getting user liked posts:', error);
        res.status(500).json({ error: 'Failed to get user liked posts', details: error.message });
    }
});

// Route to get user comments
router.get('/user-comments', async (req, res) => {
    console.log('🔄 [Express] Received request to get user comments');
    
    try {
        // Get user ID from query parameter
        const userId = req.query.userId;
        if (!userId) {
            console.error('❌ [Express] No user ID provided');
            return res.status(400).json({ error: 'User ID is required' });
        }
        
        console.log(`🔄 [Express] Getting comments for user: ${userId}`);
        
        // Get all posts
        const postsRef = collection(db, "posts");
        const postsSnapshot = await getDocs(postsRef);
        
        const userComments = [];
        
        // For each post, check for user comments
        for (const postDoc of postsSnapshot.docs) {
            const postId = postDoc.id;
            const postData = postDoc.data();
            
            // Skip deleted posts
            if (postData.isDeleted) continue;
            
            // Get comments for this post
            const commentsRef = collection(db, "posts", postId, "comments");
            const commentsSnapshot = await getDocs(commentsRef);
            
            // Filter comments by user ID
            commentsSnapshot.forEach(commentDoc => {
                const commentData = commentDoc.data();
                if (commentData.userId === userId) {
                    userComments.push({
                        id: commentDoc.id,
                        postId: postId,
                        postUserName: postData.userName,
                        postUserAvatar: postData.userAvatar,
                        postCaption: postData.caption,
                        ...convertTimestamps(commentData)
                    });
                }
            });
        }
        
        // Sort by timestamp (newest first)
        userComments.sort((a, b) => {
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
        
        console.log(`✅ [Express] Found ${userComments.length} comments for user ${userId}`);
        res.status(200).json({ comments: userComments });
    } catch (error) {
        console.error('❌ [Express] Error getting user comments:', error);
        res.status(500).json({ error: 'Failed to get user comments', details: error.message });
    }
});

// Route to get saved posts
router.get('/user-saved-posts', async (req, res) => {
    console.log('🔄 [Express] Received request to get user saved posts');
    
    try {
        // Get user ID from query parameter
        const userId = req.query.userId;
        if (!userId) {
            console.error('❌ [Express] No user ID provided');
            return res.status(400).json({ error: 'User ID is required' });
        }
        
        console.log(`🔄 [Express] Getting saved posts for user: ${userId}`);
        
        // Get user document for saved posts
        const userRef = doc(db, "user", userId);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
            console.log(`⚠️ [Express] User ${userId} not found`);
            return res.status(200).json({ posts: [] });
        }
        
        const userData = userDoc.data();
        const savedPostIds = userData.savedPosts || [];
        
        if (savedPostIds.length === 0) {
            console.log(`✅ [Express] No saved posts for user ${userId}`);
            return res.status(200).json({ posts: [] });
        }
        
        // Get details for each saved post
        const savedPosts = [];
        for (const postId of savedPostIds) {
            const postRef = doc(db, "posts", postId);
            const postDoc = await getDoc(postRef);
            
            if (postDoc.exists() && !postDoc.data().isDeleted) {
                const postData = postDoc.data();
                savedPosts.push({
                    id: postId,
                    ...convertTimestamps(postData)
                });
            }
        }
        
        console.log(`✅ [Express] Found ${savedPosts.length} saved posts for user ${userId}`);
        res.status(200).json({ posts: savedPosts });
    } catch (error) {
        console.error('❌ [Express] Error getting saved posts:', error);
        res.status(500).json({ error: 'Failed to get saved posts', details: error.message });
    }
});

module.exports = router;