import React, { useState } from 'react';
import { uploadPostImages, createPost } from '../../../api/blogService';
import { auth } from '../../../api/firebaseConfig';

const CreatePostModal = ({ onClose, onCreatePost }) => {
  const [caption, setCaption] = useState('');
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  console.log('Rendering CreatePostModal');
  
  const handleCaptionChange = (e) => {
    setCaption(e.target.value);
  };
  
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []) as File[];
    console.log('Selected files:', selectedFiles.length);
    
    if (selectedFiles.length > 0) {
      // Add selected files to files state
      setFiles([...files, ...selectedFiles]);
      
      // Create preview URLs for the files
      const newPreviewUrls = selectedFiles.map((file: File) => URL.createObjectURL(file));
      setPreviewUrls([...previewUrls, ...newPreviewUrls]);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting post with', files.length, 'images');
    
    // Validate input
    if (!caption.trim() && files.length === 0) {
      setError('Vui lòng thêm nội dung hoặc ít nhất một hình ảnh');
      return;
    }
    
    // Check if user is logged in
    if (!auth.currentUser) {
      setError('Bạn cần đăng nhập để tạo bài viết');
      return;
    }
    
    try {
      setIsUploading(true);
      setProgress(10);
      
      // Upload images if there are any
      let imageUrls = [];
      if (files.length > 0) {
        setProgress(30);
        imageUrls = await uploadPostImages(files);
        setProgress(70);
      }
      
      // Create post in Firestore
      const postId = await createPost({
        caption,
        images: imageUrls.length > 0 ? imageUrls : []
      });
      
      setProgress(100);
      console.log('Post created with ID:', postId);
      
      // Call the parent component's callback
      onCreatePost({
        id: postId,
        caption,
        images: imageUrls
      });
      
      // Reset state
      setCaption('');
      setFiles([]);
      setPreviewUrls([]);
      setError('');
      
    } catch (error) {
      console.error('Error creating post:', error);
      if (error.message && error.message.includes('requires an index')) {
        setError('Đang thiết lập cơ sở dữ liệu. Bài viết đã được lưu nhưng chưa thể hiển thị ngay.');
      } else {
        setError('Không thể tạo bài viết. Vui lòng thử lại sau.');
      }
    } finally {
      setIsUploading(false);
    }
  };
  
  const removeImage = (index) => {
    // Remove the file and preview URL at the specified index
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    
    const newPreviewUrls = [...previewUrls];
    
    // Revoke the blob URL to prevent memory leaks
    URL.revokeObjectURL(newPreviewUrls[index]);
    
    newPreviewUrls.splice(index, 1);
    setPreviewUrls(newPreviewUrls);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Create Post</h2>
            <button 
              className="text-gray-500 hover:text-gray-700"
              onClick={onClose}
              disabled={isUploading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-4">
            <textarea
              className="w-full border rounded-lg p-3 mb-4 resize-none"
              placeholder="What's on your mind?"
              rows={4}
              value={caption}
              onChange={handleCaptionChange}
              maxLength={500}
              disabled={isUploading}
            />
            
            {error && <p className="text-red-500 mb-4">{error}</p>}
            
            {/* Upload Progress */}
            {isUploading && (
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-500 h-2.5 rounded-full" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1 text-center">
                  {progress < 100 ? 'Uploading...' : 'Processing...'}
                </p>
              </div>
            )}
            
            {/* Image Preview */}
            {previewUrls.length > 0 && (
              <div className="mb-4 grid grid-cols-2 gap-2">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={url} 
                      alt={`Selected image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button 
                      type="button"
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      onClick={() => removeImage(index)}
                      disabled={isUploading}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Image Upload */}
            <div className="mb-4">
              <label className={`block w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="mt-2 block text-gray-500">Add Photos</span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  multiple 
                  onChange={handleImageChange}
                  disabled={isUploading}
                />
              </label>
              <p className="text-xs text-gray-500 mt-1">Up to 4 images will be displayed in the post preview</p>
            </div>
          </div>
          
          <div className="p-4 border-t">
            <button 
              type="submit"
              className={`w-full py-2 px-4 rounded-lg font-semibold ${
                isUploading 
                  ? 'bg-gray-400 cursor-not-allowed text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white transition-colors'
              }`}
              disabled={isUploading}
            >
              {isUploading ? 'Creating Post...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;