// src/pages/adminUI/PostsManagement.tsx

import React, { useEffect, useState } from 'react';
import { 
  fetchAllPosts, 
  hidePost, 
  deletePost, 
  restorePost 
} from '@/api/adminAPI/postsManagementService';
import AdminLayout from './components/AdminLayout';
import PostDetailDialog from './components/PostsManagement/PostDetailDialog';
import PostsAnalyticsDashboard from './components/PostsManagement/PostsAnalyticsDashboard';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import axios from 'axios';
import { Loader2, MoreHorizontal, Eye, Ban, Trash2, RefreshCw, BarChart } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "nutrigen-bot";
const FIREBASE_API_URL = process.env.NEXT_PUBLIC_FIREBASE_API_URL || "https://firestore.googleapis.com/v1";
const baseUrl = `${FIREBASE_API_URL}/projects/${PROJECT_ID}/databases/(default)/documents`;

const PostsManagement = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [postComments, setPostComments] = useState<any[]>([]);
  const [postLikes, setPostLikes] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [processingPostId, setProcessingPostId] = useState<string | null>(null);
  
  // Add active tab state
  const [activeTab, setActiveTab] = useState<'posts' | 'analytics'>('posts');

  // Fetch all posts
  const loadPosts = async () => {
    try {
      setLoading(true);
      console.log('Loading posts...');
      const data = await fetchAllPosts();
      console.log('Posts loaded successfully:', data.length);
      
      // Sort posts by creation date, newest first
      const sortedPosts = data.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setPosts(sortedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle comment deleted
  const handleCommentDeleted = (postId, commentId) => {
    console.log(`Comment ${commentId} deleted from post ${postId}`);
    
    // Remove the deleted comment from state
    setPostComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
    
    // Update comment count of the post in the list
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          commentsCount: post.commentsCount > 0 ? post.commentsCount - 1 : 0
        };
      }
      return post;
    }));
  };

  // Load posts on component mount
  useEffect(() => {
    loadPosts();
  }, []);

  // View post details handler
  const handleViewDetails = async (post: any) => {
    try {
      console.log(`Loading details for post ${post.id}...`);
      setSelectedPost(post);
      setProcessingPostId(post.id);
      
      // Fetch comments
      const commentsResponse = await axios.get(`${baseUrl}/posts/${post.id}/comments`);
      console.log('Comments loaded:', commentsResponse.data);
      
      const comments = commentsResponse.data.documents ? commentsResponse.data.documents.map((doc: any) => {
        const commentId = doc.name.split('/').pop();
        return {
          id: commentId,
          text: doc.fields?.text?.stringValue || '',
          timestamp: doc.fields?.timestamp?.timestampValue || '',
          userId: doc.fields?.userId?.stringValue || '',
          userName: doc.fields?.userName?.stringValue || '',
          userAvatar: doc.fields?.userAvatar?.stringValue || '',
        };
      }) : [];
      
      // Fetch likes
      const likesResponse = await axios.get(`${baseUrl}/posts/${post.id}/likes`);
      console.log('Likes loaded:', likesResponse.data);
      
      const likes = likesResponse.data.documents ? likesResponse.data.documents.map((doc: any) => {
        const likeId = doc.name.split('/').pop();
        return {
          id: likeId,
          timestamp: doc.fields?.timestamp?.timestampValue || '',
          userId: doc.fields?.userId?.stringValue || '',
          userName: doc.fields?.userName?.stringValue || '',
          userAvatar: doc.fields?.userAvatar?.stringValue || '',
        };
      }) : [];
      
      setPostComments(comments);
      setPostLikes(likes);
      setIsDialogOpen(true);
    } catch (error) {
      console.error('Error loading post details:', error);
      toast({
        title: "Error",
        description: "Failed to load post details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingPostId(null);
    }
  };

  // Hide post handler
  const handleHidePost = async (postId: string) => {
    try {
      setProcessingPostId(postId);
      console.log(`Hiding post ${postId}...`);
      await hidePost(postId);
      
      // Update local state
      setPosts(posts.map(post => 
        post.id === postId ? { ...post, isDeleted: true } : post
      ));
      
      toast({
        title: "Success",
        description: "Post hidden successfully.",
      });
    } catch (error) {
      console.error('Error hiding post:', error);
      toast({
        title: "Error",
        description: "Failed to hide post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingPostId(null);
    }
  };

  // Restore post handler
  const handleRestorePost = async (postId: string) => {
    try {
      setProcessingPostId(postId);
      console.log(`Restoring post ${postId}...`);
      await restorePost(postId);
      
      // Update local state
      setPosts(posts.map(post => 
        post.id === postId ? { ...post, isDeleted: false } : post
      ));
      
      toast({
        title: "Success",
        description: "Post restored successfully.",
      });
    } catch (error) {
      console.error('Error restoring post:', error);
      toast({
        title: "Error",
        description: "Failed to restore post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingPostId(null);
    }
  };

  // Delete post handler
  const handleDeletePost = async (postId: string) => {
    const postToDelete = posts.find(post => post.id === postId);
    if (!postToDelete) {
      toast({
        title: "Error",
        description: "Post not found",
        variant: "destructive"
      });
      return;
    }
    
    if (!window.confirm("Are you sure you want to permanently delete this post? This action cannot be undone and will also delete all comments, likes, and images associated with this post.")) {
      return;
    }
    
    try {
      setProcessingPostId(postId);
      console.log(`Deleting post ${postId} and all associated data...`);
      console.log(`User ID: ${postToDelete.userId}`);
      console.log(`Images:`, postToDelete.images);
      
      // Kiểm tra xem có ảnh để xóa không
      if (!postToDelete.images || postToDelete.images.length === 0) {
        console.log(`No images to delete for post ${postId}`);
      }
      
      // Truyền danh sách URL ảnh và userId để xóa khỏi storage
      await deletePost(postId, postToDelete.images, postToDelete.userId);
      
      // Remove from local state
      setPosts(posts.filter(post => post.id !== postId));
      
      toast({
        title: "Success",
        description: "Post and all associated data deleted permanently.",
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      
      // Hiển thị thông báo lỗi chi tiết hơn
      let errorMessage = "Failed to delete post. Please try again.";
      
      if (error instanceof Error) {
        errorMessage += ` Error: ${error.message}`;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setProcessingPostId(null);
    }
  }

  // Truncate caption text helper
  const truncateCaption = (text: string, maxLength: number = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Posts Management</h1>
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              onClick={() => loadPosts()}
              disabled={loading}
              className="h-10"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </>
              )}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'posts' | 'analytics')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Posts List
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts">
            <Card className="shadow-sm">
              <CardContent className="p-6">
                {loading ? (
                  <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-lg text-muted-foreground">No posts found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Post</TableHead>
                          <TableHead>Author</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-center">Likes</TableHead>
                          <TableHead className="text-center">Comments</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {posts.map((post) => (
                          <TableRow key={post.id}>
                            <TableCell>
                              <div className="flex space-x-3">
                                {post.images && post.images.length > 0 ? (
                                  <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                                    <img 
                                      src={post.images[0]} 
                                      alt="Post thumbnail" 
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs text-muted-foreground">No image</span>
                                  </div>
                                )}
                                <div className="max-w-[250px]">
                                  <p className="text-sm line-clamp-2">
                                    {truncateCaption(post.caption)}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={post.userAvatar} alt={post.userName} />
                                  <AvatarFallback>{post.userName?.slice(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">{post.userName}</span>
                              </div>
                            </TableCell>
                            
                            <TableCell>
                              <span className="text-sm">
                                {post.createdAt 
                                  ? format(new Date(post.createdAt), 'MMM d, yyyy') 
                                  : 'Unknown date'}
                              </span>
                            </TableCell>
                            
                            <TableCell className="text-center">
                              <span className="text-sm font-medium">{post.likesCount || 0}</span>
                            </TableCell>
                            
                            <TableCell className="text-center">
                              <span className="text-sm font-medium">{post.commentsCount || 0}</span>
                            </TableCell>
                            
                            <TableCell className="text-center">
                              <Badge variant={post.isDeleted ? "destructive" : "outline"}>
                                {post.isDeleted ? "Hidden" : "Visible"}
                              </Badge>
                            </TableCell>
                            
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    className="h-8 w-8 p-0"
                                    disabled={processingPostId === post.id}
                                  >
                                    {processingPostId === post.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <MoreHorizontal className="h-4 w-4" />
                                    )}
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewDetails(post)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  
                                  {post.isDeleted ? (
                                    <DropdownMenuItem onClick={() => handleRestorePost(post.id)}>
                                      <RefreshCw className="mr-2 h-4 w-4" />
                                      Restore Post
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem onClick={() => handleHidePost(post.id)}>
                                      <Ban className="mr-2 h-4 w-4" />
                                      Hide Post
                                    </DropdownMenuItem>
                                  )}
                                  
                                  <DropdownMenuItem 
                                    onClick={() => handleDeletePost(post.id)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Permanently
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics">
            <PostsAnalyticsDashboard onViewPostDetails={handleViewDetails} />
          </TabsContent>
        </Tabs>
      </div>

      {selectedPost && (
        <PostDetailDialog
          post={selectedPost}
          comments={postComments}
          likes={postLikes}
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onCommentDeleted={handleCommentDeleted}
        />
      )}
    </AdminLayout>
  );
};


export const getServerSideProps = async (context) => {
  return {
    props: {}, // Will be passed to the page component as props
  }
};

export default PostsManagement;