// frontend/src/pages/components/profile/SavedPosts.tsx
import React, { useState, useEffect } from 'react';
import { getSavedPosts } from '../../../api/userBlogService';
import { toggleSavePost } from '../../../api/blogService';
import { format } from 'date-fns';

interface SavedPostsProps {
  user: any;
}

const SavedPosts: React.FC<SavedPostsProps> = ({ user }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch saved posts on component mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching saved posts...');
        const savedPosts = await getSavedPosts();
        setPosts(savedPosts);
      } catch (err: any) {
        console.error('Error fetching saved posts:', err);
        setError(err.message || 'Could not load your saved posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPosts();
    }
  }, [user]);

  const handleUnsavePost = async (postId: string) => {
    try {
      setRemovingId(postId);
      console.log('Unsaving post:', postId);
      await toggleSavePost(postId);
      
      // Remove post from state
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    } catch (err: any) {
      console.error('Error unsaving post:', err);
      alert(err.message || 'Failed to unsave post. Please try again.');
    } finally {
      setRemovingId(null);
    }
  };

  const handleViewPost = (post: any) => {
    setSelectedPost(post);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedPost(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-red-50 p-4 rounded-lg text-red-600">
          <p>{error}</p>
          <button 
            className="mt-2 text-red-600 underline"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <h3 className="text-xl font-semibold mb-2">You haven't saved any posts yet</h3>
          <p className="text-gray-600 mb-6">When you save posts, they'll appear here for easy access later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold mb-6">Saved Posts</h2>
        
        <div className="space-y-6">
          {posts.map(post => (
            <div key={post.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              {/* Post Header */}
              <div className="flex items-center justify-between p-4 bg-gray-50">
                <div className="flex items-center">
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
                    <p className="text-xs text-gray-500">
                      {post.createdAt ? format(new Date(post.createdAt), 'MMM d, yyyy • h:mm a') : 'Unknown date'}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {/* View Button */}
                  <button 
                    onClick={() => handleViewPost(post)}
                    className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded-md hover:bg-blue-50"
                  >
                    View
                  </button>
                  
                  {/* Unsave Button */}
                  <button 
                    onClick={() => handleUnsavePost(post.id)}
                    disabled={removingId === post.id}
                    className={`text-yellow-600 hover:text-yellow-800 px-3 py-1 rounded-md hover:bg-yellow-50 ${
                      removingId === post.id ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {removingId === post.id ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Unsaving
                      </span>
                    ) : 'Unsave'}
                  </button>
                </div>
              </div>
              
              {/* Post Caption */}
              <div className="p-4 cursor-pointer" onClick={() => handleViewPost(post)}>
                <p className="whitespace-pre-line line-clamp-3">{post.caption}</p>
              </div>
              
              {/* Post Images */}
              <div className="cursor-pointer" onClick={() => handleViewPost(post)}>
                {post.images && post.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-1">
                    {post.images.slice(0, Math.min(4, post.images.length)).map((img, index) => (
                      <div 
                        key={index} 
                        className={`relative ${
                          post.images.length === 1 || (post.images.length === 3 && index === 0) 
                            ? 'col-span-2' 
                            : ''
                        }`} 
                        style={{ height: '200px' }}
                      >
                        <img 
                          src={img} 
                          alt={`Post image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Show "more" overlay on the last visible image if there are more */}
                        {index === 3 && post.images.length > 4 && (
                          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                            <span className="text-white text-lg font-medium">+{post.images.length - 4} more</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Post Stats */}
              <div className="p-4 bg-gray-50 flex justify-between">
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-1 text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{post.likesCount || 0} likes</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{post.commentsCount || 0} comments</span>
                  </div>
                </div>
                
                <div className="text-yellow-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Post Detail Modal */}
      {showDetailModal && selectedPost && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2 md:p-4"
          onClick={closeDetailModal}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col md:flex-row overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left side - Images */}
            <div className="md:w-1/2 bg-black flex items-center justify-center h-[50vh] md:h-auto relative">
              {selectedPost.images && selectedPost.images.length > 0 ? (
                <img 
                  src={selectedPost.images[0]} 
                  alt="Post image"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              
              {/* Close button */}
              <button 
                onClick={closeDetailModal}
                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Right side - Details */}
            <div className="md:w-1/2 flex flex-col h-[50vh] md:h-auto overflow-hidden">
              {/* Post Header */}
              <div className="flex items-center p-4 border-b">
                <div className="h-10 w-10 rounded-full overflow-hidden relative">
                  {selectedPost.userAvatar ? (
                    <img 
                      src={selectedPost.userAvatar} 
                      alt={selectedPost.userName}
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
                  <p className="font-semibold">{selectedPost.userName || 'Anonymous User'}</p>
                  <p className="text-xs text-gray-500">
                    {selectedPost.createdAt ? format(new Date(selectedPost.createdAt), 'MMM d, yyyy • h:mm a') : 'Unknown date'}
                  </p>
                </div>
              </div>
              
              {/* Caption */}
              <div className="p-4 flex-grow overflow-y-auto">
                <p className="whitespace-pre-line">{selectedPost.caption}</p>
                
                {/* Image thumbnails if multiple images */}
                {selectedPost.images && selectedPost.images.length > 1 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">All Images</h3>
                    <div className="flex overflow-x-auto space-x-2 pb-2">
                      {selectedPost.images.map((img, index) => (
                        <div key={index} className="flex-shrink-0 w-20 h-20">
                          <img 
                            src={img} 
                            alt={`Image ${index + 1}`}
                            className="w-full h-full object-cover rounded-md"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Actions */}
              <div className="p-4 border-t flex justify-between">
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-1 text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{selectedPost.likesCount || 0} likes</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{selectedPost.commentsCount || 0} comments</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    handleUnsavePost(selectedPost.id);
                    closeDetailModal();
                  }}
                  className="flex items-center text-yellow-600 hover:text-yellow-800"
                  disabled={removingId === selectedPost.id}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <span>Unsave</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedPosts;