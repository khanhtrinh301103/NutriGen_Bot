// frontend/src/pages/components/blog/EditPostModal.tsx
import React, { useState, useEffect } from 'react';
import { uploadPostImages } from '../../../api/blogService';

interface EditPostModalProps {
  post: any;
  onClose: () => void;
  onSave: (updatedData: any) => void;
}

const EditPostModal: React.FC<EditPostModalProps> = ({ post, onClose, onSave }) => {
  const [caption, setCaption] = useState('');
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviewUrls, setNewPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    // Initialize with existing post data
    console.log('Initializing edit modal with post:', post);
    setCaption(post.caption || '');
    setExistingImages(post.images || []);
  }, [post]);
  
  const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCaption(e.target.value);
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []) as File[];
    console.log('Selected new files:', selectedFiles.length);
    
    if (selectedFiles.length > 0) {
      // Add selected files to newFiles state
      setNewFiles([...newFiles, ...selectedFiles]);
      
      // Create preview URLs for the files
      const newUrls = selectedFiles.map(file => URL.createObjectURL(file));
      setNewPreviewUrls([...newPreviewUrls, ...newUrls]);
    }
  };
  
  const removeExistingImage = (index: number) => {
    // Remove image from existing images
    const newImages = [...existingImages];
    newImages.splice(index, 1);
    setExistingImages(newImages);
  };
  
  const removeNewImage = (index: number) => {
    // Remove file and preview URL
    const updatedFiles = [...newFiles];
    updatedFiles.splice(index, 1);
    setNewFiles(updatedFiles);
    
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(newPreviewUrls[index]);
    
    const updatedUrls = [...newPreviewUrls];
    updatedUrls.splice(index, 1);
    setNewPreviewUrls(updatedUrls);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!caption.trim() && existingImages.length === 0 && newFiles.length === 0) {
      setError('Please add either caption or images');
      return;
    }
    
    try {
      setIsUploading(true);
      setError('');
      setProgress(10);
      
      // Upload new images if any
      let allImages = [...existingImages];
      
      if (newFiles.length > 0) {
        setProgress(30);
        console.log('Uploading new images...');
        const newImageUrls = await uploadPostImages(newFiles);
        setProgress(70);
        
        // Add new image URLs to existing ones
        allImages = [...allImages, ...newImageUrls];
      }
      
      setProgress(90);
      
      // Prepare updated post data
      const updatedData = {
        caption,
        images: allImages
      };
      
      console.log('Saving updated post data:', updatedData);
      
      // Call parent's save handler
      onSave(updatedData);
      
      // Revoke all object URLs to prevent memory leaks
      newPreviewUrls.forEach(url => URL.revokeObjectURL(url));
      
      setProgress(100);
    } catch (error) {
      console.error('Error updating post:', error);
      setError('Failed to update post. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Edit Post</h2>
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
            
            {/* Existing Images Preview */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Current Images:</p>
                <div className="grid grid-cols-2 gap-2">
                  {existingImages.map((url, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={url} 
                        alt={`Existing image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button 
                        type="button"
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                        onClick={() => removeExistingImage(index)}
                        disabled={isUploading}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* New Images Preview */}
            {newPreviewUrls.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">New Images:</p>
                <div className="grid grid-cols-2 gap-2">
                  {newPreviewUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={url} 
                        alt={`New image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button 
                        type="button"
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                        onClick={() => removeNewImage(index)}
                        disabled={isUploading}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Image Upload */}
            <div className="mb-4">
              <label className={`block w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="mt-2 block text-gray-500">Add More Photos</span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  multiple 
                  onChange={handleImageChange}
                  disabled={isUploading}
                />
              </label>
              <p className="text-xs text-gray-500 mt-1">Up to 5 images total will be displayed in the post preview</p>
            </div>
          </div>
          
          <div className="p-4 border-t flex justify-end space-x-3">
            <button 
              type="button"
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              onClick={onClose}
              disabled={isUploading}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className={`px-4 py-2 rounded-lg font-semibold ${
                isUploading 
                  ? 'bg-gray-400 cursor-not-allowed text-white' 
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white transition-colors'
              }`}
              disabled={isUploading}
            >
              {isUploading ? 'Updating...' : 'Update Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostModal;