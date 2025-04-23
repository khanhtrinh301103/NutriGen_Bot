// backend/functions/deletePostImages.js

const express = require('express');
const { getStorage, ref, deleteObject, listAll } = require('firebase/storage');
const { initializeApp } = require('firebase/app');

const router = express.Router();

// Firebase config - sử dụng cấu hình giống như uploadPostImage.js
const firebaseConfig = {
    apiKey: "AIzaSyDqw21EVpn50Zat-m2GZwU-b8-3skl4dOE",
    authDomain: "nutrigen-bot-dd79d.firebaseapp.com",
    projectId: "nutrigen-bot-dd79d",
    storageBucket: "nutrigen-bot-dd79d.appspot.com",
    messagingSenderId: "159253848647",
    appId: "1:159253848647:web:03153e86e4744253078762",
    measurementId: "G-4ZHJC8C4S4"
};

// Khởi tạo ứng dụng Firebase nếu chưa có
let firebaseApp;
try {
  firebaseApp = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully in deletePostImages');
} catch (error) {
  console.log('Using existing Firebase app in deletePostImages');
}

// Khởi tạo storage
const storage = getStorage(firebaseApp);

// Hàm xóa đệ quy thư mục và tất cả file bên trong
async function deleteFolder(folderPath) {
  console.log(`🔄 Attempting to delete folder: ${folderPath}`);
  
  try {
    const folderRef = ref(storage, folderPath);
    const filesList = await listAll(folderRef);
    
    console.log(`Found ${filesList.items.length} files and ${filesList.prefixes.length} subfolders in ${folderPath}`);
    
    // Xóa tất cả file trong thư mục
    const fileDeletePromises = filesList.items.map(async (fileRef) => {
      try {
        console.log(`Deleting file: ${fileRef.fullPath}`);
        await deleteObject(fileRef);
        console.log(`Successfully deleted file: ${fileRef.fullPath}`);
        return { path: fileRef.fullPath, success: true };
      } catch (error) {
        console.error(`Failed to delete file ${fileRef.fullPath}:`, error);
        return { path: fileRef.fullPath, success: false, error: error.message };
      }
    });
    
    // Đệ quy xóa các thư mục con
    const folderDeletePromises = filesList.prefixes.map(subFolderRef => {
      console.log(`Recursively deleting subfolder: ${subFolderRef.fullPath}`);
      return deleteFolder(subFolderRef.fullPath);
    });
    
    // Đợi tất cả các thao tác xóa hoàn thành
    const results = await Promise.all([...fileDeletePromises, ...folderDeletePromises]);
    return results.flat();
  } catch (error) {
    console.error(`Error deleting folder ${folderPath}:`, error);
    return [{ path: folderPath, success: false, error: error.message }];
  }
}

// API endpoint để xóa ảnh bài viết
router.post('/delete-post-images', async (req, res) => {
  console.log('Received request to delete post images:', req.body);
  const { postId, userId, imageUrls } = req.body;
  
  if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
    console.log('Missing or invalid image URLs');
    return res.status(400).json({ error: 'Missing or invalid image URLs' });
  }

  try {
    console.log(`Attempting to delete images for post ${postId} of user ${userId}`);
    let results = [];
    let folderDeleted = false;
    
    // Phương pháp 1: Trích xuất thư mục từ URL ảnh
    if (imageUrls.length > 0) {
      try {
        const firstImageUrl = imageUrls[0];
        console.log(`Analyzing image URL: ${firstImageUrl}`);
        
        if (firstImageUrl.includes('/o/')) {
          const encodedPath = firstImageUrl.split('/o/')[1].split('?')[0];
          const decodedPath = decodeURIComponent(encodedPath);
          console.log(`Decoded path: ${decodedPath}`);
          
          // Format của URL: posts/userId/folderId/filename
          // Lấy 3 phần đầu tiên của đường dẫn để có đường dẫn thư mục
          const pathParts = decodedPath.split('/');
          if (pathParts.length >= 3) {
            const folderPath = pathParts.slice(0, 3).join('/');
            console.log(`Extracted folder path: ${folderPath}`);
            
            // Xóa toàn bộ thư mục
            results = await deleteFolder(folderPath);
            folderDeleted = true;
            
            const successCount = results.filter(result => result.success).length;
            console.log(`Deleted ${successCount} files/folders from ${folderPath}`);
          }
        }
      } catch (error) {
        console.error('Error extracting folder path from URL:', error);
      }
    }
    
    // Phương pháp 2: Nếu không thể xóa thư mục, xóa từng ảnh một
    if (!folderDeleted) {
      console.log('Folder deletion failed, falling back to individual image deletion');
      
      results = await Promise.all(imageUrls.map(async (url) => {
        try {
          const encodedPath = url.split('/o/')[1].split('?')[0];
          const filePath = decodeURIComponent(encodedPath);
          console.log(`Deleting individual file: ${filePath}`);
          
          const fileRef = ref(storage, filePath);
          await deleteObject(fileRef);
          
          console.log(`Successfully deleted file: ${filePath}`);
          return { url, success: true };
        } catch (error) {
          console.error(`Failed to delete image ${url}:`, error);
          return { url, success: false, error: error.message };
        }
      }));
    }
    
    const successCount = results.filter(result => result.success).length;
    console.log(`Total deleted: ${successCount} files/folders`);
    
    return res.json({ 
      success: true, 
      message: `Deleted ${successCount} files/folders`,
      results 
    });
  } catch (error) {
    console.error('Error in delete-post-images:', error);
    return res.status(500).json({ 
      error: 'Failed to delete images', 
      message: error.message,
      stack: error.stack 
    });
  }
});

module.exports = router;