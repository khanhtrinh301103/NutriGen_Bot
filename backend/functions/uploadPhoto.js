const express = require('express');
const multer = require('multer');
const { getStorage, ref, uploadBytes, getDownloadURL, listAll, deleteObject } = require('firebase/storage');
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
const storage = getStorage(firebaseApp, "gs://nutrigen-bot-dd79d.firebasestorage.app"); // Đảm bảo đúng tên bucket

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/upload', upload.single('file'), async (req, res) => {
  const { uid } = req.body;
  if (!req.file || !uid) {
    return res.status(400).json({ error: 'Missing file or UID' });
  }

  // Thư mục chứa ảnh của user
  const userFolderRef = ref(storage, `profile_pictures/${uid}/`);

  try {
    // Lấy danh sách tất cả ảnh cũ trong thư mục user
    const files = await listAll(userFolderRef);
    for (const file of files.items) {
      await deleteObject(file); // Xóa tất cả ảnh cũ trước khi lưu ảnh mới
    }

    // Đặt tên cố định cho ảnh mới để user chỉ có 1 ảnh duy nhất
    const fileName = `profile_pictures/${uid}/profile.jpg`;
    const fileRef = ref(storage, fileName);
    
    // Upload ảnh mới lên Firebase Storage
    const snapshot = await uploadBytes(fileRef, req.file.buffer);
    const downloadURL = await getDownloadURL(snapshot.ref);

    res.json({ photoUrl: downloadURL });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;
