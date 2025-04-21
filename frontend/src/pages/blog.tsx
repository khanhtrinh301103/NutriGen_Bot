import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from './components/common/layout';
import BlogPost from '../pages/components/blog/BlogPost';
import CreatePostModal from '../pages/components/blog/CreatePostModal';
import PostDetailModal from '../pages/components/blog/PostDetailModal';
import { getAllPosts, addComment, toggleLikePost, toggleSavePost, getPostComments, getPostLikes, isPostLiked, isPostSaved } from '../api/blogService';
import { auth } from '../api/firebaseConfig';

const BlogPage = () => {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState([]);
  const [isPostLikedByUser, setIsPostLikedByUser] = useState(false);
  const [isPostSavedByUser, setIsPostSavedByUser] = useState(false);
  
  // Load all blog posts on component mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        console.log('Fetching posts...');
        const posts = await getAllPosts();
        setBlogPosts(posts);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching posts:', err);
        // Hiển thị thông báo lỗi cụ thể hơn
        if (err.message && err.message.includes('requires an index')) {
          setError('Đang thiết lập cơ sở dữ liệu. Vui lòng thử lại sau vài phút.');
        } else {
          setError('Không thể tải bài viết. Vui lòng thử lại sau.');
        }
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);
  
  // Check authentication status
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user && showCreateModal) {
        // If user is not logged in and tries to create a post, redirect to login
        setShowCreateModal(false);
        router.push('/auth/login');
      }
    });
    
    return () => unsubscribe();
  }, [showCreateModal, router]);
  
  // Load post details when a post is selected
  useEffect(() => {
    const fetchPostDetails = async () => {
      if (selectedPost && showDetailModal) {
        try {
          console.log(`Fetching details for post: ${selectedPost.id}`);
          
          // Fetch comments
          const fetchedComments = await getPostComments(selectedPost.id);
          setComments(fetchedComments);
          
          // Fetch likes
          const fetchedLikes = await getPostLikes(selectedPost.id);
          setLikes(fetchedLikes);
          
          // Check if post is liked/saved by current user
          const liked = await isPostLiked(selectedPost.id);
          const saved = await isPostSaved(selectedPost.id);
          
          setIsPostLikedByUser(liked);
          setIsPostSavedByUser(saved);
          
          // Đồng bộ trạng thái liked giữa selectedPost và blogPosts
          setSelectedPost(prev => ({
            ...prev,
            liked
          }));
        } catch (err) {
          console.error('Error fetching post details:', err);
        }
      }
    };
    
    fetchPostDetails();
  }, [selectedPost, showDetailModal]);
  
  const handlePostClick = (post) => {
    console.log('Post clicked:', post.id);
    setSelectedPost(post);
    setShowDetailModal(true);
  };
  
  const handleCreatePost = async (newPost) => {
    try {
      console.log('Creating new post:', newPost);
      
      // Refresh posts after creation to include the new post
      const refreshedPosts = await getAllPosts();
      setBlogPosts(refreshedPosts);
      
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    }
  };
  
  const handleLikePost = async (postId) => {
    try {
      console.log('Toggling like for post:', postId);
      
      // Check if user is logged in
      if (!auth.currentUser) {
        router.push('/auth/login');
        return;
      }
      
      // Toggle like status
      const isNowLiked = await toggleLikePost(postId);
      
      // Đồng bộ luôn trạng thái like của bài viết được chọn
      if (selectedPost && selectedPost.id === postId) {
        // Update liked status for current user
        setIsPostLikedByUser(isNowLiked);
        
        // Refresh likes list
        const refreshedLikes = await getPostLikes(postId);
        setLikes(refreshedLikes);
        
        // Update the selected post like count and liked status
        setSelectedPost(prev => ({
          ...prev,
          likesCount: refreshedLikes.length,
          liked: isNowLiked
        }));
      }
      
      // Update the post in the blogPosts list
      setBlogPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            // Adjust like count based on action
            const newLikesCount = isNowLiked
              ? post.likesCount + 1
              : post.likesCount - 1;
            
            return {
              ...post,
              likesCount: Math.max(0, newLikesCount),
              liked: isNowLiked // Đồng bộ trạng thái liked
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Error toggling like for post:', error);
    }
  };
  
  const handleSavePost = async (postId) => {
    try {
      console.log('Saving post:', postId);
      
      // Check if user is logged in
      if (!auth.currentUser) {
        router.push('/auth/login');
        return;
      }
      
      // Toggle save status
      const isNowSaved = await toggleSavePost(postId);
      
      // Update UI based on result
      if (selectedPost && selectedPost.id === postId) {
        setIsPostSavedByUser(isNowSaved);
        setSelectedPost(prev => ({
          ...prev,
          saved: isNowSaved
        }));
      }
      
      // Update the post in the blogPosts list
      setBlogPosts(prevPosts =>
        prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              saved: isNowSaved
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };
  
  const handleAddComment = async (postId, comment) => {
    try {
      console.log('Adding comment to post:', postId, comment);
      
      // Check if user is logged in
      if (!auth.currentUser) {
        router.push('/auth/login');
        return;
      }
      
      // Add comment to Firestore
      const commentId = await addComment(postId, comment);
      
      // Create a new comment object for UI update
      const newComment = {
        id: commentId,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'Anonymous User',
        userAvatar: auth.currentUser.photoURL || null,
        text: comment,
        timestamp: new Date().toISOString()
      };
      
      // Update comments list for the detail view
      setComments(prevComments => [...prevComments, newComment]);
      
      // Update comment count in the selected post
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost(prev => ({
          ...prev,
          commentsCount: (prev.commentsCount || 0) + 1
        }));
      }
      
      // Update the post in the blogPosts list
      setBlogPosts(prevPosts =>
        prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              commentsCount: (post.commentsCount || 0) + 1
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <>
      <Head>
        <title>NutriGen Blog</title>
        <meta name="description" content="Share and discover nutrition recipes and tips" />
      </Head>
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">NutriGen Community</h1>
            <button 
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              onClick={() => {
                if (!auth.currentUser) {
                  router.push('/auth/login');
                } else {
                  setShowCreateModal(true);
                }
              }}
            >
              Create Your Post
            </button>
          </div>
          
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          )}
          
          {/* Error State */}
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
              <p>{error}</p>
              <button 
                className="mt-2 text-red-600 underline"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          )}
          
          {/* Empty State */}
          {!loading && !error && blogPosts.length === 0 && (
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="text-xl font-semibold mb-2">No Posts Yet</h3>
              <p className="text-gray-600 mb-4">Be the first to share your nutrition journey!</p>
              <button 
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                onClick={() => {
                  if (!auth.currentUser) {
                    router.push('/auth/login');
                  } else {
                    setShowCreateModal(true);
                  }
                }}
              >
                Create a Post
              </button>
            </div>
          )}
          
          {/* Blog Posts */}
          {!loading && !error && blogPosts.length > 0 && (
            <div className="space-y-6">
              {blogPosts.map(post => (
                <BlogPost 
                  key={post.id} 
                  post={{
                    ...post,
                    likes: post.likesCount || 0,
                    comments: post.commentsCount || 0,
                    saved: post.saved || false,
                    liked: post.liked || false, // Thêm trạng thái liked từ server
                    // Ensure post has all properties expected by the component
                    images: post.images || []
                  }}
                  onPostClick={() => handlePostClick(post)}
                  onLike={() => handleLikePost(post.id)}
                  onSave={() => handleSavePost(post.id)}
                  onComment={(comment) => handleAddComment(post.id, comment)}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Create Post Modal */}
        {showCreateModal && (
          <CreatePostModal 
            onClose={() => setShowCreateModal(false)} 
            onCreatePost={handleCreatePost}
          />
        )}
        
        {/* Post Detail Modal */}
        {showDetailModal && selectedPost && (
          <PostDetailModal 
            post={{
              ...selectedPost,
              likes: selectedPost.likesCount || 0,
              likesData: likes || [],
              comments: comments || [],
              saved: isPostSavedByUser,
              liked: isPostLikedByUser || selectedPost.liked // Sử dụng trạng thái từ selectedPost nếu cần
            }}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedPost(null);
              setComments([]);
              setLikes([]);
            }}
            onLike={() => handleLikePost(selectedPost.id)}
            onSave={() => handleSavePost(selectedPost.id)}
            onComment={(comment) => handleAddComment(selectedPost.id, comment)}
          />
        )}
      </Layout>
    </>
  );
};

export default BlogPage;