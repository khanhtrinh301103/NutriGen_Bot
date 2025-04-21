// frontend/src/pages/components/profile/ActivitySection.tsx
import React, { useState, useEffect } from 'react';
import { getUserLikedPosts, getUserComments } from '../../../api/blogService';
import { format } from 'date-fns';
import { useRouter } from 'next/router';

interface ActivitySectionProps {
  user: any;
}

const ActivitySection: React.FC<ActivitySectionProps> = ({ user }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('likes');
  const [likedPosts, setLikedPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (activeTab === 'likes') {
      fetchLikedPosts();
    } else {
      fetchUserComments();
    }
  }, [activeTab, user]);

  const fetchLikedPosts = async () => {
    try {
      setLoading(true);
      console.log('Fetching liked posts...');
      const posts = await getUserLikedPosts();
      setLikedPosts(posts);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching liked posts:', err);
      setError('Failed to load your liked posts. Please try again later.');
      setLoading(false);
    }
  };

  const fetchUserComments = async () => {
    try {
      setLoading(true);
      console.log('Fetching user comments...');
      const userComments = await getUserComments();
      setComments(userComments);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user comments:', err);
      setError('Failed to load your comments. Please try again later.');
      setLoading(false);
    }
  };

  const handleViewPost = (postId) => {
    router.push(`/blog?postId=${postId}`);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">My Activity</h2>
          
          {/* Tab buttons */}
          <div className="flex border-b">
            <button
              className={`py-2 px-4 font-medium ${
                activeTab === 'likes' 
                  ? 'text-emerald-600 border-b-2 border-emerald-500' 
                  : 'text-gray-500 hover:text-emerald-600'
              }`}
              onClick={() => setActiveTab('likes')}
            >
              Posts You've Liked
            </button>
            <button
              className={`py-2 px-4 font-medium ${
                activeTab === 'comments' 
                  ? 'text-emerald-600 border-b-2 border-emerald-500' 
                  : 'text-gray-500 hover:text-emerald-600'
              }`}
              onClick={() => setActiveTab('comments')}
            >
              Your Comments
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            <p>{error}</p>
            <button 
              className="mt-2 text-red-600 underline"
              onClick={() => activeTab === 'likes' ? fetchLikedPosts() : fetchUserComments()}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Liked Posts Tab */}
        {activeTab === 'likes' && (
          <div>
            {likedPosts.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <h3 className="text-xl font-medium text-gray-900">No liked posts yet</h3>
                <p className="mt-2 text-base text-gray-500 max-w-md mx-auto">
                  You haven't liked any posts yet. Explore the community and like posts that interest you!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {likedPosts.map(post => (
                  <div key={post.id} className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-2">
                      <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 mr-3">
                        {post.userAvatar ? (
                          <img 
                            src={post.userAvatar} 
                            alt={post.userName || 'User'}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{post.userName || 'Anonymous User'}</p>
                        <p className="text-xs text-gray-500">
                          {post.createdAt ? format(new Date(post.createdAt), 'MMM d, yyyy') : 'Unknown date'}
                        </p>
                      </div>
                      <div className="ml-auto flex items-center text-red-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs text-gray-500">
                          {post.likedAt ? format(new Date(post.likedAt), 'MMM d, h:mm a') : 'Recently'}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-2 line-clamp-2">{post.caption}</p>
                    
                    {post.images && post.images.length > 0 && (
                      <div className="mb-3">
                        <img 
                          src={post.images[0]} 
                          alt="Post image"
                          className="h-32 w-full object-cover rounded-lg"
                        />
                      </div>
                    )}
                    
                    <button
                      onClick={() => handleViewPost(post.id)}
                      className="text-emerald-600 text-sm font-medium hover:text-emerald-700"
                    >
                      View Post
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Comments Tab */}
        {activeTab === 'comments' && (
          <div>
            {comments.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="text-xl font-medium text-gray-900">No comments yet</h3>
                <p className="mt-2 text-base text-gray-500 max-w-md mx-auto">
                  You haven't commented on any posts yet. Join the conversation and share your thoughts!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map(comment => (
                  <div key={comment.id} className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 mr-3">
                          {comment.postUserAvatar ? (
                            <img 
                              src={comment.postUserAvatar} 
                              alt={comment.postUserName || 'User'}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gray-300">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            <span className="font-normal text-gray-500">Comment on</span> {comment.postUserName || 'Anonymous User'}'s post
                          </p>
                          <p className="text-xs text-gray-500">
                            {comment.timestamp ? format(new Date(comment.timestamp), 'MMM d, yyyy • h:mm a') : 'Unknown date'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                      <p className="text-gray-700">{comment.text}</p>
                    </div>
                    
                    {comment.postCaption && (
                      <div className="pl-3 border-l-2 border-gray-200 mb-3">
                        <p className="text-gray-600 text-sm line-clamp-1">
                          <span className="italic text-gray-500">Original post:</span> {comment.postCaption}
                        </p>
                      </div>
                    )}
                    
                    <button
                      onClick={() => handleViewPost(comment.postId)}
                      className="text-emerald-600 text-sm font-medium hover:text-emerald-700"
                    >
                      View Post
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivitySection;