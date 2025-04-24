import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from './components/common/layout';
import BlogPost from '../pages/components/blog/BlogPost';
import CreatePostModal from '../pages/components/blog/CreatePostModal';
import PostDetailModal from '../pages/components/blog/PostDetailModal';
import { getAllPosts, addComment, toggleLikePost, toggleSavePost, getPostComments, getPostLikes, isPostLiked, isPostSaved } from '../api/blogService';
import { auth } from '../api/firebaseConfig';
import { motion, AnimatePresence } from 'framer-motion'; // Import Framer Motion
import ProtectedRoute from '../api/ProtectedRoute';
import { useAuth } from '../api/useAuth';

const BlogPage = () => {
  const router = useRouter();
  const { user } = useAuth(); // Thêm useAuth hook để dễ dàng kiểm tra trạng thái đăng nhập
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
  const [animateItems, setAnimateItems] = useState(false);
  const [authRequiredAction, setAuthRequiredAction] = useState(null); // Để hiển thị thông báo cần đăng nhập
  
  // Load all blog posts on component mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        console.log('📝 [Blog] Fetching posts...');
        const posts = await getAllPosts();
        
        // Check saved status for each post if user is logged in
        if (user) {
          console.log('🔒 [Blog] User logged in, checking saved statuses');
          const postsWithSavedStatus = await Promise.all(posts.map(async (post) => {
            // Check if the post is saved by the current user
            const saved = await isPostSaved(post.id);
            console.log(`📌 [Blog] Post ${post.id} saved status: ${saved}`);
            return {
              ...post,
              saved
            };
          }));
          setBlogPosts(postsWithSavedStatus);
        } else {
          console.log('🔓 [Blog] User not logged in, showing posts without saved status');
          setBlogPosts(posts);
        }
        
        setLoading(false);
        
        // Start animation for posts after a short delay
        setTimeout(() => {
          setAnimateItems(true);
        }, 100);
      } catch (err) {
        console.error('❌ [Blog] Error fetching posts:', err);
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
    
    // Add auth state change listener to refresh saved posts when user logs in/out
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User logged in, refresh posts to show correct saved status
        console.log('🔄 [Blog] Auth state changed: User logged in, refreshing posts');
        fetchPosts();
      } else {
        // User logged out, reset saved status
        console.log('🔄 [Blog] Auth state changed: User logged out, updating saved status');
        setBlogPosts(prev => prev.map(post => ({...post, saved: false})));
      }
    });
    
    return () => unsubscribe();
  }, [user]);
  
  // Load post details when a post is selected
  useEffect(() => {
    const fetchPostDetails = async () => {
      if (selectedPost && showDetailModal) {
        try {
          console.log(`🔍 [Blog] Fetching details for post: ${selectedPost.id}`);
          
          // Fetch comments
          const fetchedComments = await getPostComments(selectedPost.id);
          setComments(fetchedComments);
          
          // Fetch likes
          const fetchedLikes = await getPostLikes(selectedPost.id);
          setLikes(fetchedLikes);
          
          // Check if post is liked/saved by current user (only if user is logged in)
          if (user) {
            const liked = await isPostLiked(selectedPost.id);
            const saved = await isPostSaved(selectedPost.id);
            
            console.log(`💡 [Blog] Modal: Post ${selectedPost.id} saved status: ${saved}, liked status: ${liked}`);
            
            setIsPostLikedByUser(liked);
            setIsPostSavedByUser(saved);
            
            // Đồng bộ trạng thái liked và saved giữa selectedPost và blogPosts
            setSelectedPost(prev => ({
              ...prev,
              liked,
              saved
            }));
          } else {
            console.log('🔓 [Blog] User not logged in, post details shown without like/save status');
            setIsPostLikedByUser(false);
            setIsPostSavedByUser(false);
          }
        } catch (err) {
          console.error('❌ [Blog] Error fetching post details:', err);
        }
      }
    };
    
    fetchPostDetails();
  }, [selectedPost, showDetailModal, user]);
  
  const handlePostClick = (post) => {
    console.log('🖱️ [Blog] Post clicked:', post.id);
    setSelectedPost(post);
    setShowDetailModal(true);
  };
  
  const handleCreatePost = async (newPost) => {
    try {
      // Kiểm tra xem người dùng đã đăng nhập chưa
      if (!user) {
        console.log('🔒 [Blog] Create post attempted without login, redirecting');
        setAuthRequiredAction('create');
        
        // Delay một chút để người dùng thấy thông báo
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
        
        return;
      }
      
      console.log('✏️ [Blog] Creating new post:', newPost);
      
      // Refresh posts after creation to include the new post
      const refreshedPosts = await getAllPosts();
      
      // Check saved status for each post if user is logged in
      if (user) {
        const postsWithSavedStatus = await Promise.all(refreshedPosts.map(async (post) => {
          const saved = await isPostSaved(post.id);
          return {
            ...post,
            saved
          };
        }));
        
        // Reset animation state before updating posts
        setAnimateItems(false);
        setBlogPosts(postsWithSavedStatus);
      } else {
        // Reset animation state before updating posts
        setAnimateItems(false);
        setBlogPosts(refreshedPosts);
      }
      
      // Re-trigger animations after posts update
      setTimeout(() => {
        setAnimateItems(true);
      }, 100);
      
      setShowCreateModal(false);
    } catch (error) {
      console.error('❌ [Blog] Error creating post:', error);
      alert('Failed to create post. Please try again.');
    }
  };
  
  const handleLikePost = async (postId) => {
    try {
      console.log('👍 [Blog] Toggling like for post:', postId);
      
      // Check if user is logged in
      if (!user) {
        console.log('🔒 [Blog] Like action attempted without login, showing notification');
        setAuthRequiredAction('like');
        
        // Delay một chút để người dùng thấy thông báo
        setTimeout(() => {
          router.push('/auth/login');
          setAuthRequiredAction(null); // Reset sau khi đã hiển thị
        }, 2000);
        
        return;
      }
      
      // Toggle like status
      const isNowLiked = await toggleLikePost(postId);
      console.log(`✅ [Blog] Post ${postId} is now ${isNowLiked ? 'liked' : 'unliked'}`);
      
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
      setBlogPosts(prevPosts => {
        const updatedPosts = prevPosts.map(post => {
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
        });
        
        return updatedPosts;
      });
    } catch (error) {
      console.error('❌ [Blog] Error toggling like for post:', error);
    }
  };
  
  const handleSavePost = async (postId) => {
    try {
      console.log('🔖 [Blog] Toggling save for post:', postId);
      
      // Check if user is logged in
      if (!user) {
        console.log('🔒 [Blog] Save action attempted without login, showing notification');
        setAuthRequiredAction('save');
        
        // Delay một chút để người dùng thấy thông báo
        setTimeout(() => {
          router.push('/auth/login');
          setAuthRequiredAction(null); // Reset sau khi đã hiển thị
        }, 2000);
        
        return;
      }
      
      // Toggle save status
      const isNowSaved = await toggleSavePost(postId);
      console.log(`✅ [Blog] Post ${postId} is now ${isNowSaved ? 'saved' : 'unsaved'}`);
      
      // Update UI based on result
      if (selectedPost && selectedPost.id === postId) {
        console.log(`🔄 [Blog] Updating selected post ${postId} saved status to ${isNowSaved}`);
        setIsPostSavedByUser(isNowSaved);
        setSelectedPost(prev => ({
          ...prev,
          saved: isNowSaved
        }));
      }
      
      // Update the post in the blogPosts list
      setBlogPosts(prevPosts => {
        const updatedPosts = prevPosts.map(post => {
          if (post.id === postId) {
            console.log(`🔄 [Blog] Updating post ${postId} in blogPosts list, saved status: ${isNowSaved}`);
            return {
              ...post,
              saved: isNowSaved
            };
          }
          return post;
        });
        
        return updatedPosts;
      });
    } catch (error) {
      console.error('❌ [Blog] Error toggling save for post:', error);
    }
  };
  
  const handleAddComment = async (postId, comment) => {
    try {
      console.log('💬 [Blog] Adding comment to post:', postId, comment);
      
      // Check if user is logged in
      if (!user) {
        console.log('🔒 [Blog] Comment action attempted without login, showing notification');
        setAuthRequiredAction('comment');
        
        // Delay một chút để người dùng thấy thông báo
        setTimeout(() => {
          router.push('/auth/login');
          setAuthRequiredAction(null); // Reset sau khi đã hiển thị
        }, 2000);
        
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
      console.error('❌ [Blog] Error adding comment:', error);
    }
  };

  // Animation variants for items
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 260, 
        damping: 20 
      }
    }
  };
  
  // Animation for the page title
  const titleVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        duration: 0.7 
      }
    }
  };
  
  // Button hover animation
  const buttonVariants = {
    hover: { 
      scale: 1.05,
      backgroundColor: "#22c55e", // Green-600
      boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.3 }
    },
    tap: { 
      scale: 0.95 
    }
  };

  // Render thông báo yêu cầu đăng nhập
  const renderAuthRequiredNotification = () => {
    if (!authRequiredAction) return null;
    
    let message = '';
    switch(authRequiredAction) {
      case 'like':
        message = 'You need to sign in to like posts';
        break;
      case 'save':
        message = 'You need to sign in to save posts';
        break;
      case 'comment':
        message = 'You need to sign in to comment on posts';
        break;
      case 'create':
        message = 'You need to sign in to create a post';
        break;
      default:
        message = 'You need to sign in to perform this action';
    }
    
    return (
      <motion.div
        className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-amber-50 border-l-4 border-amber-400 p-4 w-full max-w-md shadow-lg rounded-lg z-50"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-amber-700">
              {message}
            </p>
            <p className="mt-2 text-xs text-amber-700">
              Redirecting to login page...
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <ProtectedRoute>
      <>
        <Head>
          <title>NutriGen Blog</title>
          <meta name="description" content="Share and discover nutrition recipes and tips" />
        </Head>
        
        {/* Thông báo yêu cầu đăng nhập */}
        <AnimatePresence>
          {authRequiredAction && renderAuthRequiredNotification()}
        </AnimatePresence>
        
        <Layout>
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
              <motion.h1 
                className="text-3xl font-bold"
                initial="hidden"
                animate="visible"
                variants={titleVariants}
              >
                NutriGen Community
              </motion.h1>
              <motion.button 
                className="bg-green-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                whileHover="hover"
                whileTap="tap"
                variants={buttonVariants}
                onClick={() => {
                  if (!user) {
                    console.log('🔒 [Blog] Create post button clicked without login, showing notification');
                    setAuthRequiredAction('create');
                    setTimeout(() => {
                      router.push('/auth/login');
                      setAuthRequiredAction(null);
                    }, 2000);
                  } else {
                    setShowCreateModal(true);
                  }
                }}
              >
                Create Your Post
              </motion.button>
            </div>
            
            {/* Loading State */}
            <AnimatePresence>
              {loading && (
                <motion.div 
                  className="flex justify-center items-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Error State */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  className="bg-red-100 text-red-700 p-4 rounded-lg mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                >
                  <p>{error}</p>
                  <motion.button 
                    className="mt-2 text-red-600 underline"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Empty State */}
            <AnimatePresence>
              {!loading && !error && blogPosts.length === 0 && (
                <motion.div 
                  className="text-center py-12"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 300,
                    damping: 25
                  }}
                >
                  <motion.svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-16 w-16 mx-auto text-gray-400 mb-4" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: 360 }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </motion.svg>
                  <motion.h3 
                    className="text-xl font-semibold mb-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    No Posts Yet
                  </motion.h3>
                  <motion.p 
                    className="text-gray-600 mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                  >
                    Be the first to share your nutrition journey!
                  </motion.p>
                  <motion.button 
                    className="bg-green-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                    whileHover="hover"
                    whileTap="tap"
                    variants={buttonVariants}
                    onClick={() => {
                      if (!user) {
                        console.log('🔒 [Blog] Create post button clicked without login in empty state, showing notification');
                        setAuthRequiredAction('create');
                        setTimeout(() => {
                          router.push('/auth/login');
                          setAuthRequiredAction(null);
                        }, 2000);
                      } else {
                        setShowCreateModal(true);
                      }
                    }}
                  >
                    Create a Post
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Blog Posts */}
            {!loading && !error && blogPosts.length > 0 && (
              <motion.div 
                className="space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate={animateItems ? "show" : "hidden"}
              >
                {blogPosts.map((post, index) => (
                  <motion.div 
                    key={post.id}
                    variants={itemVariants} 
                    custom={index}
                    layoutId={`post-${post.id}`}
                    className="transform-gpu"
                  >
                    <BlogPost 
                      post={{
                        ...post,
                        likes: post.likesCount || 0,
                        comments: post.commentsCount || 0,
                        saved: post.saved || false,
                        liked: post.liked || false,
                        images: post.images || []
                      }}
                      onPostClick={() => handlePostClick(post)}
                      onLike={() => handleLikePost(post.id)}
                      onSave={() => handleSavePost(post.id)}
                      onComment={(comment) => handleAddComment(post.id, comment)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
          
          {/* Create Post Modal */}
          <AnimatePresence>
            {showCreateModal && user && ( // Chỉ hiển thị modal khi đã đăng nhập
              <CreatePostModal 
                onClose={() => setShowCreateModal(false)} 
                onCreatePost={handleCreatePost}
              />
            )}
          </AnimatePresence>
          
          {/* Post Detail Modal */}
          <AnimatePresence>
            {showDetailModal && selectedPost && (
              <PostDetailModal 
                post={{
                  ...selectedPost,
                  likes: selectedPost.likesCount || 0,
                  likesData: likes || [],
                  comments: comments || [],
                  saved: isPostSavedByUser,
                  liked: isPostLikedByUser || selectedPost.liked
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
          </AnimatePresence>
        </Layout>
      </>
    </ProtectedRoute>
  );
};

export default BlogPage;