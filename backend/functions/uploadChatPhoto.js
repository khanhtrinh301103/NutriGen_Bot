// backend/functions/uploadChatPhoto.js
const express = require('express');
const multer = require('multer');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { initializeApp } = require('firebase/app');

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
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// API endpoint để upload hình ảnh chat
router.post('/uploadChatPhoto', upload.single('file'), async (req, res) => {
  try {
    const { uid, chatId } = req.body;
    
    if (!req.file || !uid || !chatId) {
      console.log("❌ [Upload] Missing file, UID, or chatId", { uid, chatId });
      return res.status(400).json({ error: 'Missing file, UID, or chatId' });
    }

    // Generate unique name for chat images
    const timestamp = new Date().getTime();
    const fileName = `chat_images/${chatId}/${uid}_${timestamp}.jpg`;
    const fileRef = ref(storage, fileName);
    
    console.log(`🔄 [Upload] Uploading chat image: ${fileName}`);
    
    // Upload image to Firebase Storage
    const snapshot = await uploadBytes(fileRef, req.file.buffer);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log(`✅ [Upload] Successfully uploaded chat image: ${downloadURL}`);
    
    res.json({ imageUrl: downloadURL });
  } catch (error) {
    console.error('❌ [Upload] Error uploading chat image:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;