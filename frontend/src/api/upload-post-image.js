// src/pages/api/upload-post-image.js

import formidable from 'formidable';
import fs from 'fs';
import axios from 'axios';

// Disable body parser to handle form data
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('🔄 [Next API] Received post image upload request');

  try {
    // Parse the form data using formidable
    const form = new formidable.IncomingForm({
      multiples: true,
      keepExtensions: true,
    });

    // Parse form and wait for result
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Get user ID if available
    const userId = fields.userId || 'anonymous';
    console.log(`🔄 [Next API] Processing ${files.files ? (Array.isArray(files.files) ? files.files.length : 1) : 0} files for user: ${userId}`);

    // Create form data for Express backend
    const formData = new FormData();
    formData.append('userId', userId);

    // Add files to form data
    const filesArray = files.files ? (Array.isArray(files.files) ? files.files : [files.files]) : [];
    
    for (const file of filesArray) {
      if (file && file.filepath) {
        // Read file data
        const fileData = fs.readFileSync(file.filepath);
        
        // Append to form data
        formData.append('files', new Blob([fileData], { type: file.mimetype }), 
                         file.originalFilename || 'image.jpg');
        
        console.log(`🔄 [Next API] Added file: ${file.originalFilename || 'image.jpg'} (${file.size} bytes)`);
      }
    }

    // Send to Express backend
    console.log(`🔄 [Next API] Sending request to backend: https://nutrigen-bot.onrender.com/api/upload-post-image`);
    const response = await axios.post(
      'https://nutrigen-bot.onrender.com/api/upload-post-image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    // Clean up temp files
    for (const file of filesArray) {
      if (file && file.filepath) {
        try {
          fs.unlinkSync(file.filepath);
        } catch (err) {
          console.warn(`⚠️ [Next API] Could not delete temp file: ${file.filepath}`, err);
        }
      }
    }

    console.log(`✅ [Next API] Upload successful, received ${response.data.imageUrls?.length || 0} URLs`);
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('❌ [Next API] Error uploading images:', error);
    return res.status(500).json({ 
      error: 'Failed to upload images',
      details: error.message 
    });
  }
}