// frontend/src/pages/components/profile/MyPostsSection.tsx
import React, { useState, useEffect } from 'react';
import { getUserPosts, updatePost, deletePost } from '../../../api/blogService';
import BlogPost from '../blog/BlogPost';
import EditPostModal from '../blog/EditPostModal';

interface MyPostsSectionProps {
  user: any;
}

const MyPostsSection: React.FC<MyPostsSectionProps> = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [deletingPostId, setDeletingPostId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserPosts();
  }, [user]);

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      console.log('Fetching user posts...');
      const userPosts = await getUserPosts();
      setPosts(userPosts);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user posts:', err);
      setError('Failed to load your posts. Please try again later.');
      setLoading(false);
    }
  };

  const handleEditPost = (post) => {
    console.log('Editing post:', post);
    setEditingPost(post);
  };

  const handleUpdatePost = async (postId, updatedData) => {
    try {
      console.log('Updating post:', postId, updatedData);
      await updatePost(postId, updatedData);
      
      // Update post in the list
      setPosts(prevPosts => 
        prevPosts.map(post => post.id === postId ? { ...post, ...updatedData } : post)
      );
      
      setEditingPost(null);
    } catch (err) {
      console.error('Error updating post:', err);
      setError('Failed to update post. Please try again.');
    }
  };

  const confirmDeletePost = (postId) => {
    setDeletingPostId(postId);
  };

  const handleDeletePost = async () => {
    try {
      console.log('Deleting post:', deletingPostId);
      await deletePost(deletingPostId);
      
      // Remove post from the list
      setPosts(prevPosts => prevPosts.filter(post => post.id !== deletingPostId));
      
      setDeletingPostId(null);
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Failed to delete post. Please try again.');
      setDeletingPostId(null);
    }
  };

  const cancelDelete = () => {
    setDeletingPostId(null);
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
          <h2 className="text-2xl font-bold text-gray-800">Your Posts</h2>
          <span className="bg-emerald-100 text-emerald-800 text-sm font-medium px-3 py-1 rounded-full">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'}
          </span>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            <p>{error}</p>
            <button 
              className="mt-2 text-red-600 underline"
              onClick={fetchUserPosts}
            >
              Try Again
            </button>
          </div>
        )}

        {posts.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900">No posts yet</h3>
            <p className="mt-2 text-base text-gray-500 max-w-md mx-auto">
              You haven't created any posts yet. Start sharing your nutrition journey with the community!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map(post => (
              <div key={post.id} className="relative">
                <BlogPost 
                  post={post}
                  onPostClick={() => {}} // Không cần xử lý click trong trang này
                  onLike={() => {}}      // Không cần xử lý like trong trang này
                  onSave={() => {}}      // Không cần xử lý save trong trang này
                  onComment={() => {}}   // Không cần xử lý comment trong trang này
                />
                <div className="flex space-x-2 mt-2 justify-end">
                  <button
                    onClick={() => handleEditPost(post)}
                    className="px-4 py-2 text-emerald-600 border border-emerald-200 rounded-md hover:bg-emerald-50 transition-colors"
                  >
                    Edit Post
                  </button>
                  <button
                    onClick={() => confirmDeletePost(post.id)}
                    className="px-4 py-2 text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Post Modal */}
      {editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSave={(updatedData) => handleUpdatePost(editingPost.id, updatedData)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingPostId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Delete Post</h3>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePost}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPostsSection;