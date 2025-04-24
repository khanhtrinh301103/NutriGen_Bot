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
  const [animateItems, setAnimateItems] = useState(false);
  
  // Load all blog posts on component mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        console.log('Fetching posts...');
        const posts = await getAllPosts();
        
        // Check saved status for each post if user is logged in
        if (auth.currentUser) {
          const postsWithSavedStatus = await Promise.all(posts.map(async (post) => {
            // Check if the post is saved by the current user
            const saved = await isPostSaved(post.id);
            console.log(`Post ${post.id} saved status: ${saved}`);
            return {
              ...post,
              saved
            };
          }));
          setBlogPosts(postsWithSavedStatus);
        } else {
          setBlogPosts(posts);
        }
        
        setLoading(false);
        
        // Start animation for posts after a short delay
        setTimeout(() => {
          setAnimateItems(true);
        }, 100);
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
    
    // Add auth state change listener to refresh saved posts when user logs in/out
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User logged in, refresh posts to show correct saved status
        fetchPosts();
      } else {
        // User logged out, reset saved status
        setBlogPosts(prev => prev.map(post => ({...post, saved: false})));
      }
    });
    
    return () => unsubscribe();
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
          
          console.log(`Modal: Post ${selectedPost.id} saved status: ${saved}, liked status: ${liked}`);
          
          setIsPostLikedByUser(liked);
          setIsPostSavedByUser(saved);
          
          // Đồng bộ trạng thái liked và saved giữa selectedPost và blogPosts
          setSelectedPost(prev => ({
            ...prev,
            liked,
            saved
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
      
      // Check saved status for each post if user is logged in
      if (auth.currentUser) {
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
      console.log(`Post ${postId} is now ${isNowLiked ? 'liked' : 'unliked'}`);
      
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
        
        console.log('Updated blogPosts after like action:', 
          updatedPosts.map(p => ({ id: p.id, liked: p.liked }))
        );
        
        return updatedPosts;
      });
    } catch (error) {
      console.error('Error toggling like for post:', error);
    }
  };
  
  const handleSavePost = async (postId) => {
    try {
      console.log('Toggling save for post:', postId);
      
      // Check if user is logged in
      if (!auth.currentUser) {
        router.push('/auth/login');
        return;
      }
      
      // Toggle save status
      const isNowSaved = await toggleSavePost(postId);
      console.log(`Post ${postId} is now ${isNowSaved ? 'saved' : 'unsaved'}`);
      
      // Update UI based on result
      if (selectedPost && selectedPost.id === postId) {
        console.log(`Updating selected post ${postId} saved status to ${isNowSaved}`);
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
            console.log(`Updating post ${postId} in blogPosts list, saved status: ${isNowSaved}`);
            return {
              ...post,
              saved: isNowSaved
            };
          }
          return post;
        });
        
        console.log('Updated blogPosts after save action:', 
          updatedPosts.map(p => ({ id: p.id, saved: p.saved }))
        );
        
        return updatedPosts;
      });
    } catch (error) {
      console.error('Error toggling save for post:', error);
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

  return (
    <>
      <Head>
        <title>NutriGen Blog</title>
        <meta name="description" content="Share and discover nutrition recipes and tips" />
      </Head>
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
                if (!auth.currentUser) {
                  router.push('/auth/login');
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
                    if (!auth.currentUser) {
                      router.push('/auth/login');
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
          {showCreateModal && (
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
  );
};

export default BlogPage;