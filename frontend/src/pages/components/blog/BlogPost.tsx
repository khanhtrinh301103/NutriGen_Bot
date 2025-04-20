import React, { useState } from 'react';
import { format } from 'date-fns';
import { auth } from '../../../api/firebaseConfig';
import { useRouter } from 'next/router';

const BlogPost = ({ post, onPostClick, onLike, onSave, onComment }) => {
  const [comment, setComment] = useState('');
  const [showAllCaption, setShowAllCaption] = useState(false);
  const router = useRouter();
  
  console.log('Rendering BlogPost:', post.id);
  
  // Format the timestamp
  const formattedDate = post.createdAt 
    ? format(new Date(post.createdAt), 'MMM d, yyyy')
    : 'Unknown date';
  
  // Logic for caption truncation
  const maxCaptionLength = 100;
  const isCaptionLong = post.caption && post.caption.length > maxCaptionLength;
  const displayCaption = showAllCaption 
    ? post.caption 
    : (post.caption ? post.caption.slice(0, maxCaptionLength) : '');
  
  // Image display logic
  const maxVisibleImages = 5;
  const images = post.images || [];
  const hasMoreImages = images.length > maxVisibleImages;
  const visibleImages = images.slice(0, maxVisibleImages);
  const additionalImagesCount = images.length - maxVisibleImages;
  
  // Check if user is authenticated
  const isAuthenticated = !!auth.currentUser;
  
  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    if (comment.trim()) {
      onComment(comment);
      setComment('');
    }
  };
  
  const handleLike = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    onLike();
  };
  
  const handleSave = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    onSave();
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Post Header */}
      <div className="flex items-center p-4">
        <div className="h-10 w-10 rounded-full overflow-hidden relative">
          {post.userAvatar ? (
            <img 
              src={post.userAvatar} 
              alt={post.userName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
        </div>
        <div className="ml-3">
          <p className="font-semibold">{post.userName || 'Anonymous User'}</p>
          <p className="text-xs text-gray-500">{formattedDate}</p>
        </div>
      </div>
      
      {/* Post Caption */}
      {post.caption && (
        <div className="px-4 pb-2">
          <p>
            {displayCaption}
            {isCaptionLong && !showAllCaption && '... '}
            {isCaptionLong && (
              <button 
                className="text-blue-500 hover:text-blue-700"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAllCaption(true);
                }}
              >
                {showAllCaption ? '' : 'See more'}
              </button>
            )}
          </p>
        </div>
      )}
      
      {/* Post Images */}
      <div className="relative" onClick={() => onPostClick()}>
        {images.length === 0 ? (
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        ) : images.length === 1 ? (
          <div className="w-full h-96 relative cursor-pointer">
            <img 
              src={images[0]} 
              alt="Post image"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1 cursor-pointer">
            {visibleImages.map((img, index) => (
              <div 
                key={index} 
                className={`relative ${images.length === 3 && index === 0 ? 'col-span-2' : ''}`} 
                style={{ height: '200px' }}
              >
                <img 
                  src={img} 
                  alt={`Post image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {index === maxVisibleImages - 1 && hasMoreImages && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">+{additionalImagesCount}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Post Actions */}
      <div className="p-4">
        <div className="flex justify-between mb-2">
          <div className="flex space-x-4">
            <button 
              className={`flex items-center space-x-1 ${post.liked ? 'text-red-500' : 'text-gray-700 hover:text-red-500'}`}
              onClick={handleLike}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={post.liked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{post.likes || 0}</span>
            </button>
            <button 
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-500"
              onClick={(e) => {
                e.stopPropagation();
                onPostClick();
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{post.comments?.length || 0}</span>
            </button>
          </div>
          <button 
            className={`text-gray-700 ${post.saved ? 'text-yellow-500' : 'hover:text-yellow-500'}`}
            onClick={handleSave}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={post.saved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>
        
        {/* Latest Comments Preview */}
        {post.comments && post.comments.length > 0 && (
          <div className="mb-2">
            <div className="text-sm text-gray-700">
              <span className="font-semibold">{post.comments[post.comments.length - 1].userName || 'Anonymous User'}</span>{" "}
              {post.comments[post.comments.length - 1].text}
            </div>
            {post.comments.length > 1 && (
              <button 
                className="text-gray-500 text-sm hover:text-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  onPostClick();
                }}
              >
                View all {post.comments.length} comments
              </button>
            )}
          </div>
        )}
        
        {/* Add Comment Form */}
        <form 
          className="flex mt-3" 
          onSubmit={handleSubmitComment}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="text"
            className="flex-grow bg-gray-100 rounded-l-full py-2 px-4 outline-none"
            placeholder={isAuthenticated ? "Add a comment..." : "Sign in to comment"}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={!isAuthenticated}
          />
          <button 
            type="submit"
            className={`px-4 py-2 font-medium rounded-r-full ${
              isAuthenticated && comment.trim()
                ? 'bg-blue-500 text-white hover:bg-blue-600 transition-colors'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!isAuthenticated || !comment.trim()}
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
};

export default BlogPost;