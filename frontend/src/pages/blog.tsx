import React, { useState } from 'react';
import Head from 'next/head';
import Layout from './components/common/layout';
import BlogPost from '../pages/components/blog/BlogPost';
import CreatePostModal from '../pages/components/blog/CreatePostModal';
import PostDetailModal from '../pages/components/blog/PostDetailModal';

// Sample blog posts data
const sampleBlogPosts = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Khanh Trinh',
    userAvatar: 'https://i.pravatar.cc/150?img=1',
    caption: 'Just finished cooking this amazing Mediterranean dish! It\'s dairy-free and perfect for my diet restrictions. The combination of fresh vegetables, olive oil, and herbs creates a burst of flavors that\'s both healthy and delicious.',
    images: [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
    ],
    likes: 42,
    comments: [
      { id: 'c1', userId: 'user2', userName: 'Minh Nguyen', text: 'Looks delicious! Can you share the recipe?', timestamp: '2025-04-18T15:30:00Z' },
      { id: 'c2', userId: 'user3', userName: 'Linh Pham', text: 'I need to try this!', timestamp: '2025-04-18T16:45:00Z' }
    ],
    saved: false,
    timestamp: '2025-04-18T14:20:00Z'
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Minh Nguyen',
    userAvatar: 'https://i.pravatar.cc/150?img=2',
    caption: 'Today I discovered this amazing vegetarian recipe that\'s high in protein and perfect for my fitness goals. I\'ve been trying to incorporate more plant-based meals into my diet, and this one definitely hits the spot. The texture is amazing and the flavor profile is complex yet balanced.',
    images: [
      'https://images.unsplash.com/photo-1540914124281-342587941389',
      'https://images.unsplash.com/photo-1540420773420-3366772f4999',
      'https://images.unsplash.com/photo-1540420828642-fca2c5c18abe',
      'https://images.unsplash.com/photo-1540420781687-147599739aab',
      'https://images.unsplash.com/photo-1540420808789-8a82e63fae50',
      'https://images.unsplash.com/photo-1540420773420-3366772f4999',
    ],
    likes: 78,
    comments: [
      { id: 'c3', userId: 'user1', userName: 'Khanh Trinh', text: 'This looks amazing!', timestamp: '2025-04-17T10:20:00Z' },
      { id: 'c4', userId: 'user4', userName: 'Nam Le', text: 'I need the recipe too!', timestamp: '2025-04-17T11:15:00Z' }
    ],
    saved: true,
    timestamp: '2025-04-17T09:45:00Z'
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Linh Pham',
    userAvatar: 'https://i.pravatar.cc/150?img=3',
    caption: 'My weekly meal prep is done! These containers have saved me so much time and helped me stick to my nutrition goals. Each meal is balanced with protein, healthy fats, and complex carbs.',
    images: [
      'https://images.unsplash.com/photo-1547592180-85f173990554',
      'https://images.unsplash.com/photo-1543362906-acfc16c67564',
      'https://images.unsplash.com/photo-1512058564366-18510be2db19',
    ],
    likes: 56,
    comments: [
      { id: 'c5', userId: 'user2', userName: 'Minh Nguyen', text: 'Great organization!', timestamp: '2025-04-16T18:30:00Z' }
    ],
    saved: false,
    timestamp: '2025-04-16T16:20:00Z'
  }
];

const BlogPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [blogPosts, setBlogPosts] = useState(sampleBlogPosts);
  
  console.log('Rendering BlogPage with', blogPosts.length, 'posts');
  
  const handlePostClick = (post) => {
    console.log('Post clicked:', post.id);
    setSelectedPost(post);
    setShowDetailModal(true);
  };
  
  const handleCreatePost = (newPost) => {
    console.log('Creating new post:', newPost);
    const postWithId = {
      ...newPost,
      id: Date.now().toString(),
      userId: 'currentUser', // In a real app, get this from auth
      userName: 'Current User',
      userAvatar: 'https://i.pravatar.cc/150?img=8',
      likes: 0,
      comments: [],
      saved: false,
      timestamp: new Date().toISOString()
    };
    
    setBlogPosts([postWithId, ...blogPosts]);
    setShowCreateModal(false);
  };
  
  const handleLikePost = (postId) => {
    console.log('Liking post:', postId);
    setBlogPosts(
      blogPosts.map(post => 
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };
  
  const handleSavePost = (postId) => {
    console.log('Saving post:', postId);
    setBlogPosts(
      blogPosts.map(post => 
        post.id === postId ? { ...post, saved: !post.saved } : post
      )
    );
  };
  
  const handleAddComment = (postId, comment) => {
    console.log('Adding comment to post:', postId, comment);
    setBlogPosts(
      blogPosts.map(post => {
        if (post.id === postId) {
          const newComment = {
            id: `c${Date.now()}`,
            userId: 'currentUser',
            userName: 'Current User',
            text: comment,
            timestamp: new Date().toISOString()
          };
          return {
            ...post,
            comments: [...post.comments, newComment]
          };
        }
        return post;
      })
    );
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
              onClick={() => setShowCreateModal(true)}
            >
              Create Your Post
            </button>
          </div>
          
          <div className="space-y-6">
            {blogPosts.map(post => (
              <BlogPost 
                key={post.id} 
                post={post} 
                onPostClick={() => handlePostClick(post)}
                onLike={() => handleLikePost(post.id)}
                onSave={() => handleSavePost(post.id)}
                onComment={(comment) => handleAddComment(post.id, comment)}
              />
            ))}
          </div>
        </div>
        
        {showCreateModal && (
          <CreatePostModal 
            onClose={() => setShowCreateModal(false)} 
            onCreatePost={handleCreatePost}
          />
        )}
        
        {showDetailModal && selectedPost && (
          <PostDetailModal 
            post={selectedPost} 
            onClose={() => setShowDetailModal(false)}
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