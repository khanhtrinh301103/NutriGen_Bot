// frontend/src/pages/components/profile/ActivityHistory.tsx
import React, { useState, useEffect } from 'react';
import { getLikedPosts, getCommentedPosts } from '../../../api/userBlogService';
import { toggleLikePost, toggleSavePost, addComment } from '../../../api/blogService';
import { format, formatDistance } from 'date-fns';
import { auth } from '../../../api/firebaseConfig';
import { useRouter } from 'next/router';

interface ActivityHistoryProps {
  user: any;
}

const ActivityHistory: React.FC<ActivityHistoryProps> = ({ user }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('likes');
  const [likedPosts, setLikedPosts] = useState<any[]>([]);
  const [commentedPosts, setCommentedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [newComment, setNewComment] = useState('');

  // Fetch activity data based on active tab
  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (activeTab === 'likes') {
          console.log('Fetching liked posts...');
          if (likedPosts.length === 0) {
            const posts = await getLikedPosts();
            setLikedPosts(posts);
          }
        } else {
          console.log('Fetching commented posts...');
          if (commentedPosts.length === 0) {
            const posts = await getCommentedPosts();
            setCommentedPosts(posts);
          }
        }
      } catch (err: any) {
        console.error(`Error fetching ${activeTab}:`, err);
        setError(err.message || `Could not load your ${activeTab}. Please try again later.`);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchActivityData();
    }
  }, [user, activeTab, likedPosts.length, commentedPosts.length]);

  const handleViewPost = (post: any) => {
    setSelectedPost(post);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedPost(null);
    setNewComment('');
  };

  const handleLikePost = async (postId: string) => {
    try {
      if (!auth.currentUser) {
        router.push('/auth/login');
        return;
      }
      
      console.log('Toggling like for post:', postId);
      const isNowLiked = await toggleLikePost(postId);
      
      // Update like status and count in the state
      if (activeTab === 'likes') {
        setLikedPosts(prevPosts => prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              likesCount: isNowLiked ? post.likesCount + 1 : post.likesCount - 1,
              liked: isNowLiked
            };
          }
          return post;
        }));
      } else {
        setCommentedPosts(prevPosts => prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              likesCount: isNowLiked ? post.likesCount + 1 : post.likesCount - 1,
              liked: isNowLiked
            };
          }
          return post;
        }));
      }
      
      // Update selected post if it's the one being liked
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost({
          ...selectedPost,
          likesCount: isNowLiked ? selectedPost.likesCount + 1 : selectedPost.likesCount - 1,
          liked: isNowLiked
        });
      }
    } catch (error) {
      console.error('Error toggling like for post:', error);
    }
  };

  const handleSavePost = async (postId: string) => {
    try {
      if (!auth.currentUser) {
        router.push('/auth/login');
        return;
      }
      
      console.log('Toggling save for post:', postId);
      const isNowSaved = await toggleSavePost(postId);
      
      // Update save status in the state
      const updatePostSaveStatus = (posts: any[]) => {
        return posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              saved: isNowSaved
            };
          }
          return post;
        });
      };
      
      if (activeTab === 'likes') {
        setLikedPosts(updatePostSaveStatus);
      } else {
        setCommentedPosts(updatePostSaveStatus);
      }
      
      // Update selected post if it's the one being saved
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost({
          ...selectedPost,
          saved: isNowSaved
        });
      }
    } catch (error) {
      console.error('Error toggling save for post:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPost || !newComment.trim()) return;
    
    try {
      if (!auth.currentUser) {
        router.push('/auth/login');
        return;
      }
      
      console.log('Adding comment to post:', selectedPost.id, newComment);
      const commentId = await addComment(selectedPost.id, newComment);
      
      // Create a new comment object
      const comment = {
        id: commentId,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'Anonymous User',
        userAvatar: auth.currentUser.photoURL || null,
        text: newComment,
        timestamp: new Date().toISOString()
      };
      
      // Update the selected post
      const updatedSelectedPost = {
        ...selectedPost,
        commentsCount: selectedPost.commentsCount + 1,
        comments: selectedPost.comments ? [...selectedPost.comments, comment] : [comment]
      };
      
      setSelectedPost(updatedSelectedPost);
      
      // Update the posts list
      const updatePostsComments = (posts: any[]) => {
        return posts.map(post => {
          if (post.id === selectedPost.id) {
            // If it's a commented post (in commented tab), add the comment to the list
            if (activeTab === 'comments') {
              const updatedComments = post.comments ? [...post.comments, comment] : [comment];
              return {
                ...post,
                commentsCount: post.commentsCount + 1,
                comments: updatedComments,
                lastCommentAt: new Date().toISOString()
              };
            } else {
              // Otherwise just update the count
              return {
                ...post,
                commentsCount: post.commentsCount + 1
              };
            }
          }
          return post;
        });
      };
      
      if (activeTab === 'likes') {
        setLikedPosts(updatePostsComments);
      } else {
        setCommentedPosts(updatePostsComments);
      }
      
      // Clear the input
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
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

  const activePosts = activeTab === 'likes' ? likedPosts : commentedPosts;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Activity Tabs */}
        <div className="flex border-b">
          <button
            className={`py-3 px-6 font-medium ${
              activeTab === 'likes' 
                ? 'text-emerald-600 border-b-2 border-emerald-500' 
                : 'text-gray-500 hover:text-emerald-600'
            }`}
            onClick={() => setActiveTab('likes')}
          >
            Liked Posts
          </button>
          <button
            className={`py-3 px-6 font-medium ${
              activeTab === 'comments' 
                ? 'text-emerald-600 border-b-2 border-emerald-500' 
                : 'text-gray-500 hover:text-emerald-600'
            }`}
            onClick={() => setActiveTab('comments')}
          >
            Commented Posts
          </button>
        </div>
        
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">
            {activeTab === 'likes' ? 'Posts You\'ve Liked' : 'Posts You\'ve Commented'}
          </h2>
          
          {/* Empty state */}
          {activePosts.length === 0 && (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {activeTab === 'likes' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                )}
              </svg>
              <h3 className="text-xl font-semibold mb-2">
                {activeTab === 'likes' 
                  ? 'You haven\'t liked any posts yet' 
                  : 'You haven\'t commented on any posts yet'
                }
              </h3>
              <p className="text-gray-600 mb-6">
                {activeTab === 'likes'
                  ? 'When you like posts, they\'ll appear here for you to find them easily.'
                  : 'When you comment on posts, they\'ll appear here for you to track your conversations.'
                }
              </p>
            </div>
          )}
          
          {/* Post List */}
          {activePosts.length > 0 && (
            <div className="space-y-6">
              {activePosts.map(post => {
                // Check if post has been deleted by author
                const isDeleted = post.isDeleted;
                
                return (
                  <div 
                    key={post.id} 
                    className={`border rounded-lg overflow-hidden ${
                      isDeleted ? 'opacity-60 bg-gray-50' : 'hover:shadow-md'
                    } transition-shadow`}
                  >
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
                      
                      <div className="flex items-center">
                        {/* Activity timestamp */}
                        <div className="text-xs text-gray-500 mr-4">
                          {activeTab === 'likes' ? (
                            <span>
                              Liked {formatDistance(new Date(post.likedAt), new Date(), { addSuffix: true })}
                            </span>
                          ) : (
                            <span>
                              Commented {formatDistance(new Date(post.lastCommentAt), new Date(), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                        
                        {/* View Button - only if not deleted */}
                        {!isDeleted && (
                          <button 
                            onClick={() => handleViewPost(post)}
                            className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded-md hover:bg-blue-50"
                          >
                            View
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Content or Deleted Message */}
                    {isDeleted ? (
                      <div className="p-4 italic text-gray-500 text-center">
                        This post has been deleted by the author
                      </div>
                    ) : (
                      <>
                        {/* Post Caption */}
                        <div className="p-4 cursor-pointer" onClick={() => handleViewPost(post)}>
                          <p className="whitespace-pre-line line-clamp-3">{post.caption}</p>
                        </div>
                        
                        {/* User's Comments (if on comments tab) */}
                        {activeTab === 'comments' && post.comments && post.comments.length > 0 && (
                          <div className="p-4 bg-gray-50 border-t border-b">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Your Comments:</h4>
                            <div className="space-y-3 max-h-32 overflow-y-auto">
                              {post.comments.map(comment => (
                                <div key={comment.id} className="bg-white p-3 rounded-lg text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-xs text-gray-500">
                                      {format(new Date(comment.timestamp), 'MMM d, yyyy • h:mm a')}
                                    </span>
                                  </div>
                                  <p className="mt-1">{comment.text}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
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
                                  style={{ height: '160px' }}
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
                            <button 
                              className={`flex items-center space-x-1 ${post.liked ? 'text-red-500' : 'text-gray-700 hover:text-red-500'}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLikePost(post.id);
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={post.liked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              <span>{post.likesCount || 0}</span>
                            </button>
                            <div className="flex items-center space-x-1 text-gray-700">
                              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${activeTab === 'comments' ? 'text-blue-500' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              <span>{post.commentsCount || 0}</span>
                            </div>
                          </div>
                          
                          {/* Save button */}
                          <button 
                            className={`text-gray-700 ${post.saved ? 'text-yellow-500' : 'hover:text-yellow-500'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSavePost(post.id);
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={post.saved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Post Detail Modal */}
      {showDetailModal && selectedPost && !selectedPost.isDeleted && (
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
              <div className="p-4 border-b">
                <p className="whitespace-pre-line">{selectedPost.caption}</p>
              </div>
              
              {/* Comments and Likes */}
              <div className="flex-grow overflow-y-auto">
                {/* User's Comments (if on comments tab) */}
                {activeTab === 'comments' && selectedPost.comments && selectedPost.comments.length > 0 && (
                  <div className="p-4 border-b">
                    <h3 className="text-md font-medium text-gray-800 mb-3">Your Comments:</h3>
                    <div className="space-y-3">
                      {selectedPost.comments.map(comment => (
                        <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">
                              {format(new Date(comment.timestamp), 'MMM d, yyyy • h:mm a')}
                            </span>
                          </div>
                          <p className="mt-1">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Image thumbnails if multiple images */}
                {selectedPost.images && selectedPost.images.length > 1 && (
                  <div className="p-4">
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
                  <button 
                    className={`flex items-center space-x-1 ${selectedPost.liked ? 'text-red-500' : 'text-gray-700 hover:text-red-500'}`}
                    onClick={() => handleLikePost(selectedPost.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={selectedPost.liked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{selectedPost.likesCount || 0}</span>
                  </button>
                  <div className="flex items-center space-x-1 text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${activeTab === 'comments' ? 'text-blue-500' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{selectedPost.commentsCount || 0}</span>
                  </div>
                </div>
                
                {/* Save button */}
                <button 
                  className={`text-gray-700 ${selectedPost.saved ? 'text-yellow-500' : 'hover:text-yellow-500'}`}
                  onClick={() => handleSavePost(selectedPost.id)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={selectedPost.saved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>
              
              {/* Add Comment Form */}
              <div className="p-4 border-t">
                {auth.currentUser ? (
                  <form 
                    className="flex" 
                    onSubmit={handleSubmitComment}
                  >
                    <input
                      type="text"
                      className="flex-grow bg-gray-100 rounded-l-full py-2 px-4 outline-none"
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button 
                      type="submit"
                      className={`px-4 py-2 font-medium rounded-r-full ${
                        newComment.trim()
                          ? 'bg-blue-500 text-white hover:bg-blue-600 transition-colors'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!newComment.trim()}
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
      )}
    </div>
  );
};

export default ActivityHistory;