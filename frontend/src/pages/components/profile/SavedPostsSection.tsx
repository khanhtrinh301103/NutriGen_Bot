// frontend/src/pages/components/profile/SavedPostsSection.tsx
import React, { useState, useEffect } from 'react';
import { getSavedPosts, toggleSavePost } from '../../../api/blogService';
import BlogPost from '../blog/BlogPost';
import PostDetailModal from '../blog/PostDetailModal';

interface SavedPostsSectionProps {
  user: any;
}

const SavedPostsSection: React.FC<SavedPostsSectionProps> = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchSavedPosts();
  }, [user]);

  const fetchSavedPosts = async () => {
    try {
      setLoading(true);
      console.log('Fetching saved posts...');
      const savedPosts = await getSavedPosts();
      setPosts(savedPosts);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching saved posts:', err);
      setError('Failed to load your saved posts. Please try again later.');
      setLoading(false);
    }
  };

  const handlePostClick = (post) => {
    console.log('Post clicked:', post.id);
    setSelectedPost(post);
    setShowDetailModal(true);
  };

  const handleUnsavePost = async (postId) => {
    try {
      console.log('Unsaving post:', postId);
      await toggleSavePost(postId);
      // Remove the post from the list after unsaving
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    } catch (err) {
      console.error('Error unsaving post:', err);
      setError('Failed to unsave post. Please try again.');
    }
  };

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
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Saved Posts</h2>
          <span className="bg-emerald-100 text-emerald-800 text-sm font-medium px-3 py-1 rounded-full">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'}
          </span>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            <p>{error}</p>
            <button 
              className="mt-2 text-red-600 underline"
              onClick={fetchSavedPosts}
            >
              Try Again
            </button>
          </div>
        )}

        {posts.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900">No saved posts yet</h3>
            <p className="mt-2 text-base text-gray-500 max-w-md mx-auto">
              You haven't saved any posts yet. Browse the community and save posts you find interesting!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map(post => (
              <div key={post.id} className="relative">
                <BlogPost 
                  post={{
                    ...post,
                    saved: true // Post is already saved
                  }}
                  onPostClick={() => handlePostClick(post)}
                  onLike={() => {}} // Not handling like in this context
                  onSave={() => handleUnsavePost(post.id)}
                  onComment={() => {}} // Not handling comments in this context
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post Detail Modal */}
      {showDetailModal && selectedPost && (
        <PostDetailModal 
          post={{
            ...selectedPost,
            saved: true, // Post is already saved
            likesData: likes || [],
            comments: comments || []
          }}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedPost(null);
            setComments([]);
            setLikes([]);
          }}
          onLike={() => {}} // Not handling like in this context
          onSave={() => handleUnsavePost(selectedPost.id)}
          onComment={() => {}} // Not handling comments in this context
        />
      )}
    </div>
  );
};

export default SavedPostsSection;