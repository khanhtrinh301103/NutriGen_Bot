import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { auth } from '../../../api/firebaseConfig';

const PostDetailModal = ({ post, onClose, onLike, onSave, onComment }) => {
  const [comment, setComment] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLikesList, setShowLikesList] = useState(false);
  const commentInputRef = useRef(null);
  
  console.log('Rendering PostDetailModal for post:', post.id);
  
  // Format the timestamp
  const formattedDate = post.createdAt 
    ? format(new Date(post.createdAt), 'MMM d, yyyy')
    : 'Unknown date';
  
  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (comment.trim()) {
      onComment(comment);
      setComment('');
    }
  };
  
  const focusCommentInput = () => {
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
  };
  
  const nextImage = (e) => {
    e.stopPropagation();
    if (currentImageIndex < post.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };
  
  const prevImage = (e) => {
    e.stopPropagation();
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };
  
  const toggleLikesList = (e) => {
    e.stopPropagation();
    setShowLikesList(!showLikesList);
  };
  
  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Check if user is authenticated
  const isAuthenticated = !!auth.currentUser;

  // Render avatar for user
  const renderUserAvatar = (user) => {
    if (user.userAvatar) {
      return (
        <img 
          src={user.userAvatar} 
          alt={user.userName || 'User'}
          className="w-full h-full object-cover rounded-full"
        />
      );
    } else {
      return (
        <div className="w-full h-full bg-gray-300 flex items-center justify-center rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      );
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2 md:p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col md:flex-row overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left side - Images */}
        <div className="md:w-1/2 bg-black flex items-center justify-center h-[50vh] md:h-auto">
          {post.images && post.images.length > 0 ? (
            <div className="relative w-full h-full">
              <img 
                src={post.images[currentImageIndex]} 
                alt="Post image"
                className="w-full h-full object-contain"
              />
              
              {/* Image navigation arrows if more than one image */}
              {post.images.length > 1 && (
                <>
                  <button 
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-1"
                    onClick={prevImage}
                    disabled={currentImageIndex === 0}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-1"
                    onClick={nextImage}
                    disabled={currentImageIndex === post.images.length - 1}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
        
        {/* Right side - Details */}
        <div className="md:w-1/2 flex flex-col h-[50vh] md:h-auto overflow-hidden">
          {/* Post Header */}
          <div className="flex items-center p-4 border-b">
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
          
          {/* Caption */}
          <div className="p-4 border-b">
            <p className="whitespace-pre-line">{post.caption}</p>
          </div>
          
          {/* Comments and Likes */}
          <div className="flex-grow overflow-y-auto">
            {/* Likes section */}
            <div className="p-4 border-b">
              <button 
                className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900 cursor-pointer"
                onClick={toggleLikesList}
              >
                <span>{post.likes} {post.likes === 1 ? 'like' : 'likes'}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showLikesList ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                </svg>
              </button>
              
              {/* Likes list (collapsed by default) */}
              {showLikesList && post.likesData && post.likesData.length > 0 && (
                <div className="mt-2 max-h-40 overflow-y-auto">
                  <ul className="space-y-2">
                    {post.likesData.map(like => (
                      <li key={like.id} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded">
                        <div className="h-8 w-8 rounded-full overflow-hidden">
                          {renderUserAvatar(like)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{like.userName || 'Anonymous User'}</p>
                          <p className="text-xs text-gray-500">
                            {like.timestamp ? format(new Date(like.timestamp), 'MMM d, h:mm a') : ''}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {/* Comments section */}
            <div className="p-4">
              <h3 className="font-medium text-gray-900 mb-2">
                {post.comments?.length || 0} {(post.comments?.length || 0) === 1 ? 'Comment' : 'Comments'}
              </h3>
              
              {post.comments && post.comments.length > 0 ? (
                <div className="space-y-3">
                  {post.comments.map(comment => (
                    <div key={comment.id} className="flex">
                      <div className="h-8 w-8 rounded-full overflow-hidden relative flex-shrink-0">
                        {renderUserAvatar(comment)}
                      </div>
                      <div className="ml-2">
                        <div className="bg-gray-100 rounded-2xl px-3 py-2">
                          <p className="font-semibold text-sm">{comment.userName || 'Anonymous User'}</p>
                          <p className="text-sm">{comment.text}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {comment.timestamp ? format(new Date(comment.timestamp), 'MMM d, h:mm a') : 'Just now'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center">No comments yet. Be the first to comment!</p>
              )}
            </div>
          </div>
          
          {/* Post Actions */}
          <div className="p-4 border-t flex justify-between">
            <div className="flex space-x-4">
              <button 
                className={`flex items-center space-x-1 ${post.liked ? 'text-red-500' : 'text-gray-700 hover:text-red-500'}`}
                onClick={() => isAuthenticated ? onLike() : null}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={post.liked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{post.likes || 0}</span>
              </button>
              <button 
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-500"
                onClick={focusCommentInput}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{post.comments?.length || 0}</span>
              </button>
            </div>
            <button 
              className={`text-gray-700 ${post.saved ? 'text-yellow-500' : 'hover:text-yellow-500'}`}
              onClick={() => isAuthenticated ? onSave() : null}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={post.saved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>
          
          {/* Add Comment Form */}
          <div className="p-4 border-t">
            {isAuthenticated ? (
              <form 
                className="flex" 
                onSubmit={handleSubmitComment}
              >
                <input
                  type="text"
                  className="flex-grow bg-gray-100 rounded-l-full py-2 px-4 outline-none"
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  ref={commentInputRef}
                />
                <button 
                  type="submit"
                  className="bg-blue-500 text-white rounded-r-full px-4 py-2 font-medium hover:bg-blue-600 transition-colors"
                  disabled={!comment.trim()}
                >
                  Post
                </button>
              </form>
            ) : (
              <div className="bg-gray-100 rounded-lg p-3 text-center">
                <p className="text-gray-600">Sign in to leave a comment</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;