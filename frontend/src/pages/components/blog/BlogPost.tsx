import React, { useState } from 'react';
import { format } from 'date-fns';

const BlogPost = ({ post, onPostClick, onLike, onSave, onComment }) => {
  const [comment, setComment] = useState('');
  const [showAllCaption, setShowAllCaption] = useState(false);
  
  console.log('Rendering BlogPost:', post.id);
  
  // Format the timestamp
  const formattedDate = format(new Date(post.timestamp), 'MMM d, yyyy');
  
  // Logic for caption truncation
  const maxCaptionLength = 100;
  const isCaptionLong = post.caption.length > maxCaptionLength;
  const displayCaption = showAllCaption ? post.caption : post.caption.slice(0, maxCaptionLength);
  
  // Image display logic
  const maxVisibleImages = 5;
  const hasMoreImages = post.images.length > maxVisibleImages;
  const visibleImages = post.images.slice(0, maxVisibleImages);
  const additionalImagesCount = post.images.length - maxVisibleImages;
  
  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (comment.trim()) {
      onComment(comment);
      setComment('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Post Header */}
      <div className="flex items-center p-4">
        <div className="h-10 w-10 rounded-full overflow-hidden relative">
          <img 
            src={post.userAvatar} 
            alt={post.userName}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="ml-3">
          <p className="font-semibold">{post.userName}</p>
          <p className="text-xs text-gray-500">{formattedDate}</p>
        </div>
      </div>
      
      {/* Post Caption */}
      <div className="px-4 pb-2">
        <p>
          {displayCaption}
          {isCaptionLong && !showAllCaption && '... '}
          {isCaptionLong && (
            <button 
              className="text-blue-500 hover:text-blue-700"
              onClick={() => setShowAllCaption(true)}
            >
              {showAllCaption ? '' : 'See more'}
            </button>
          )}
        </p>
      </div>
      
      {/* Post Images */}
      <div className="relative" onClick={() => onPostClick()}>
        {post.images.length === 1 ? (
          <div className="w-full h-96 relative cursor-pointer">
            <img 
              src={post.images[0]} 
              alt="Post image"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1 cursor-pointer">
            {visibleImages.map((img, index) => (
              <div 
                key={index} 
                className={`relative ${post.images.length === 3 && index === 0 ? 'col-span-2' : ''}`} 
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
              className="flex items-center space-x-1 text-gray-700 hover:text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                onLike();
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{post.likes}</span>
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
              <span>{post.comments.length}</span>
            </button>
          </div>
          <button 
            className={`text-gray-700 ${post.saved ? 'text-yellow-500' : 'hover:text-yellow-500'}`}
            onClick={(e) => {
              e.stopPropagation();
              onSave();
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={post.saved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>
        
        {/* Latest Comments Preview */}
        {post.comments.length > 0 && (
          <div className="mb-2">
            <div className="text-sm text-gray-700">
              <span className="font-semibold">{post.comments[post.comments.length - 1].userName}</span>{" "}
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
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button 
            type="submit"
            className="bg-blue-500 text-white rounded-r-full px-4 py-2 font-medium hover:bg-blue-600 transition-colors"
            disabled={!comment.trim()}
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
};

export default BlogPost;