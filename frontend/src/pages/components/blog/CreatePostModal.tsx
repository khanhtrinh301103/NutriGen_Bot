import React, { useState } from 'react';

const CreatePostModal = ({ onClose, onCreatePost }) => {
  const [caption, setCaption] = useState('');
  const [imageUrls, setImageUrls] = useState([]);
  const [error, setError] = useState('');
  
  console.log('Rendering CreatePostModal');
  
  const handleCaptionChange = (e) => {
    setCaption(e.target.value);
  };
  
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    console.log('Selected files:', files.length);
    
    if (files.length > 0) {
      // For demo purposes, we're using placeholder URLs directly
      // In a real app, you would upload these to storage
      const newImageUrls = files.map(() => {
        // Generate random placeholder image URL
        const randomId = Math.floor(Math.random() * 1000);
        return `https://picsum.photos/id/${randomId}/400/300`;
      });
      
      setImageUrls([...imageUrls, ...newImageUrls]);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting post with', imageUrls.length, 'images');
    
    if (!caption.trim() && imageUrls.length === 0) {
      setError('Please add a caption or at least one image');
      return;
    }
    
    // In a real app, these would be uploaded image URLs from storage
    onCreatePost({
      caption,
      images: imageUrls.length > 0 ? imageUrls : [
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c' // Placeholder if no images
      ]
    });
  };
  
  const removeImage = (index) => {
    const newImageUrls = [...imageUrls];
    newImageUrls.splice(index, 1);
    setImageUrls(newImageUrls);
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
            />
            
            {error && <p className="text-red-500 mb-4">{error}</p>}
            
            {/* Image Preview */}
            {imageUrls.length > 0 && (
              <div className="mb-4 grid grid-cols-2 gap-2">
                {imageUrls.map((url, index) => (
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
              <label className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50">
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
                />
              </label>
              <p className="text-xs text-gray-500 mt-1">Up to 5 images will be displayed in the post preview</p>
            </div>
          </div>
          
          <div className="p-4 border-t">
            <button 
              type="submit"
              className="bg-green-500 text-white font-semibold rounded-lg py-2 px-4 w-full hover:bg-green-600 transition-colors"
            >
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;