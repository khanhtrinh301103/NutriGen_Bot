// backend/functions/uploadPostImage.js
const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { initializeApp } = require('firebase/app');

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
const storage = getStorage(firebaseApp, "gs://nutrigen-bot-dd79d.firebasestorage.app");

const router = express.Router();
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // Limit 5MB
});

// Route to upload post images
router.post('/upload-post-image', upload.array('files', 10), async (req, res) => {
    console.log('🔄 [Express] Received request to upload post images');
    
    try {
        // Check if files were uploaded
        if (!req.files || req.files.length === 0) {
            console.error('❌ [Express] No files provided');
            return res.status(400).json({ error: 'No files provided' });
        }
        
        // Get user ID from request
        const userId = req.body.userId || 'anonymous';
        console.log(`🔄 [Express] Processing upload for user: ${userId}`);
        
        // Generate a unique post ID for this batch
        const postId = uuidv4();
        const imageUrls = [];
        
        // Process each file
        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            
            // Create unique filename: posts/{userId}/{postId}/{index}-{timestamp}.jpg
            const fileName = `posts/${userId}/${postId}/${i}-${Date.now()}.jpg`;
            const fileRef = ref(storage, fileName);
            
            // Upload to Firebase Storage
            console.log(`🔄 [Express] Uploading file: ${fileName} (${file.size} bytes)`);
            await uploadBytes(fileRef, file.buffer, {
                contentType: file.mimetype
            });
            
            // Get download URL
            const downloadURL = await getDownloadURL(fileRef);
            console.log(`✅ [Express] File uploaded: ${downloadURL}`);
            
            // Add URL to result array
            imageUrls.push(downloadURL);
        }
        
        // Return successful response with image URLs
        console.log(`✅ [Express] Successfully uploaded ${imageUrls.length} images`);
        res.status(200).json({ imageUrls });
    } catch (error) {
        console.error('❌ [Express] Error uploading post images:', error);
        res.status(500).json({ error: 'Upload failed', details: error.message });
    }
});

module.exports = router;