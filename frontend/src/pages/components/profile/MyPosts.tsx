// frontend/src/pages/components/profile/MyPosts.tsx
import React, { useState, useEffect } from 'react';
import { getUserPosts, deletePost, updatePost } from '../../../api/userBlogService';
import { uploadPostImages, toggleLikePost, toggleSavePost, addComment, isPostLiked, isPostSaved } from '../../../api/blogService';
import { format } from 'date-fns';
import { useRouter } from 'next/router';
import { auth } from '../../../api/firebaseConfig';

interface MyPostsProps {
  user: any;
}

interface EditPostData {
  id: string;
  caption: string;
  images: string[];
}

const MyPosts: React.FC<MyPostsProps> = ({ user }) => {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<EditPostData | null>(null);
  const [newCaption, setNewCaption] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [newComment, setNewComment] = useState('');

  // Fetch user's posts on component mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching user posts...');
        const userPosts = await getUserPosts();
        
        // Check if posts are liked or saved by the current user
        const postsWithStatus = await Promise.all(userPosts.map(async (post) => {
          const liked = await isPostLiked(post.id);
          const saved = await isPostSaved(post.id);
          return {
            ...post,
            liked,
            saved
          };
        }));
        
        setPosts(postsWithStatus);
      } catch (err: any) {
        console.error('Error fetching user posts:', err);
        setError(err.message || 'Could not load your posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPosts();
    }
  }, [user]);

  // Initialize edit form when a post is selected for editing
  useEffect(() => {
    if (editingPost) {
      setNewCaption(editingPost.caption || '');
      setPreviewUrls(editingPost.images || []);
      setFiles([]);
    } else {
      setNewCaption('');
      setPreviewUrls([]);
      setFiles([]);
    }
  }, [editingPost]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    console.log('Selected files:', selectedFiles.length);
    
    if (selectedFiles.length > 0) {
      // Add selected files to files state
      setFiles([...files, ...selectedFiles]);
      
      // Create preview URLs for the files
      const newPreviewUrls = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls([...previewUrls, ...newPreviewUrls]);
    }
  };
  
  const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewCaption(e.target.value);
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }
    
    try {
      setDeletingId(postId);
      console.log('Deleting post:', postId);
      await deletePost(postId);
      
      // Remove the post from the UI
      setPosts(currentPosts => currentPosts.filter(post => post.id !== postId));
    } catch (err: any) {
      console.error('Error deleting post:', err);
      alert(err.message || 'Failed to delete post. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditPost = (post: any) => {
    console.log('Editing post:', post.id);
    setEditingPost({
      id: post.id,
      caption: post.caption || '',
      images: post.images || []
    });
  };

  const handleCancelEdit = () => {
    // Clean up any created object URLs to prevent memory leaks
    files.forEach(file => {
      if (!editingPost?.images.includes(URL.createObjectURL(file))) {
        URL.revokeObjectURL(URL.createObjectURL(file));
      }
    });
    
    setEditingPost(null);
  };

  const handleSaveEdit = async () => {
    if (!editingPost) return;
    
    try {
      setIsUpdating(true);
      console.log('Updating post:', editingPost.id);
      
      let imageUrls = [...editingPost.images];
      
      // Upload new images if any
      if (files.length > 0) {
        const uploadedImageUrls = await uploadPostImages(files);
        imageUrls = [...imageUrls, ...uploadedImageUrls];
      }
      
      // Update the post in Firestore
      await updatePost(editingPost.id, {
        caption: newCaption,
        images: imageUrls
      });
      
      // Update the post in the UI
      setPosts(currentPosts => 
        currentPosts.map(post => 
          post.id === editingPost.id 
            ? { ...post, caption: newCaption, images: imageUrls }
            : post
        )
      );
      
      // Reset editing state
      setEditingPost(null);
    } catch (err: any) {
      console.error('Error updating post:', err);
      alert(err.message || 'Failed to update post. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      if (!auth.currentUser) {
        router.push('/auth/login');
        return;
      }
      
      console.log('Toggling like for post:', postId);
      const isNowLiked = await toggleLikePost(postId);
      
      // Update post in the state
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likesCount: isNowLiked ? post.likesCount + 1 : Math.max(0, post.likesCount - 1),
            liked: isNowLiked
          };
        }
        return post;
      }));
      
      // Update selected post if it's the one being liked
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost({
          ...selectedPost,
          likesCount: isNowLiked ? selectedPost.likesCount + 1 : Math.max(0, selectedPost.likesCount - 1),
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
      
      // Update post in the state
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            saved: isNowSaved
          };
        }
        return post;
      }));
      
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

  const handleViewPost = (post: any) => {
    setSelectedPost(post);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedPost(null);
    setNewComment('');
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
      
      // Update the post in the list
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === selectedPost.id) {
          return {
            ...post,
            commentsCount: post.commentsCount + 1
          };
        }
        return post;
      }));
      
      // Clear the input
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const removeImage = (index: number) => {
    const newPreviewUrls = [...previewUrls];
    
    // If this is a File that we just added, release the blob URL
    if (files.length > 0 && index >= editingPost?.images.length) {
      URL.revokeObjectURL(newPreviewUrls[index]);
      
      // Remove from files array too
      const newFiles = [...files];
      const fileIndex = index - (editingPost?.images.length || 0);
      if (fileIndex >= 0 && fileIndex < newFiles.length) {
        newFiles.splice(fileIndex, 1);
        setFiles(newFiles);
      }
    }
    
    newPreviewUrls.splice(index, 1);
    setPreviewUrls(newPreviewUrls);
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-xl font-semibold mb-2">You haven't created any posts yet</h3>
          <p className="text-gray-600 mb-6">Share your nutrition journey with the community!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold mb-6">My Posts</h2>
        
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
                    <p className="font-semibold">{post.userName || 'You'}</p>
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
                  
                  {/* Edit Button */}
                  <button 
                    onClick={() => handleEditPost(post)}
                    className="text-green-600 hover:text-green-800 px-3 py-1 rounded-md hover:bg-green-50"
                  >
                    Edit
                  </button>
                  
                  {/* Delete Button */}
                  <button 
                    onClick={() => handleDeletePost(post.id)}
                    disabled={deletingId === post.id}
                    className={`text-red-600 hover:text-red-800 px-3 py-1 rounded-md hover:bg-red-50 ${
                      deletingId === post.id ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {deletingId === post.id ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Deleting
                      </span>
                    ) : 'Delete'}
                  </button>
                </div>
              </div>
              
              {/* Post Caption */}
              <div className="p-4 cursor-pointer" onClick={() => handleViewPost(post)}>
                <p className="whitespace-pre-line">{post.caption}</p>
              </div>
              
              {/* Post Images */}
              <div className="cursor-pointer" onClick={() => handleViewPost(post)}>
                {post.images && post.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-1">
                    {post.images.slice(0, Math.min(4, post.images.length)).map((img, index) => (
                      <div 
                        key={index} 
                        className={`relative ${post.images.length === 1 || (post.images.length === 3 && index === 0) ? 'col-span-2' : ''}`} 
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            </div>
          ))}
        </div>
      </div>
      
      {/* Edit Post Modal */}
      {editingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Edit Post</h2>
                <button 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <textarea
                className="w-full border rounded-lg p-3 mb-4 resize-none"
                placeholder="What's on your mind?"
                rows={4}
                value={newCaption}
                onChange={handleCaptionChange}
                maxLength={500}
                disabled={isUpdating}
              />
              
              {/* Image Preview */}
              {previewUrls.length > 0 && (
                <div className="mb-4 grid grid-cols-3 gap-2">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={url} 
                        alt={`Selected image ${index + 1}`}
                        className="w-full h-28 object-cover rounded-lg"
                      />
                      <button 
                        type="button"
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                        onClick={() => removeImage(index)}
                        disabled={isUpdating}
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
                <label className={`block w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}>
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
                    disabled={isUpdating}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-1">You can add up to 5 images</p>
              </div>
            </div>
            
            <div className="p-4 border-t flex justify-end space-x-3">
              <button 
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                className={`px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors ${isUpdating ? 'opacity-75 cursor-not-allowed' : ''}`}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
      
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
              <div className="p-4 border-b">
                <p className="whitespace-pre-line">{selectedPost.caption}</p>
              </div>
              
              {/* Comments and Likes */}
              <div className="flex-grow overflow-y-auto">
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
                
                {/* Comments section */}
                <div className="p-4 border-t">
                  <h3 className="font-medium text-gray-900 mb-2">
                    {selectedPost.commentsCount || 0} {(selectedPost.commentsCount || 0) === 1 ? 'Comment' : 'Comments'}
                  </h3>
                  
                  {selectedPost.comments && selectedPost.comments.length > 0 ? (
                    <div className="space-y-3">
                      {selectedPost.comments.map(comment => (
                        <div key={comment.id} className="flex">
                          <div className="h-8 w-8 rounded-full overflow-hidden relative flex-shrink-0">
                            {comment.userAvatar ? (
                              <img 
                                src={comment.userAvatar} 
                                alt={comment.userName}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-300 flex items-center justify-center rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                            )}
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
                    className={`flex items-center space-x-1 ${selectedPost.liked ? 'text-red-500' : 'text-gray-700 hover:text-red-500'}`}
                    onClick={() => handleLikePost(selectedPost.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={selectedPost.liked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{selectedPost.likesCount || 0}</span>
                  </button>
                  <div className="flex items-center space-x-1 text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{selectedPost.commentsCount || 0}</span>
                  </div>
                </div>
                
                {/* Save Button */}
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


export const getServerSideProps = async (context) => {
  return {
    props: {}, // Will be passed to the page component as props
  }
};

export default MyPosts;