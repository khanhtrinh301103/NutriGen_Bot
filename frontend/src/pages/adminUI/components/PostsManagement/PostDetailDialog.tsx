// src/pages/adminUI/components/PostsManagement/PostDetailDialog.tsx

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { deleteComment } from '@/api/adminAPI/postsManagementService';

interface Comment {
  id: string;
  text: string;
  timestamp: string;
  userId: string;
  userName: string;
  userAvatar: string;
}

interface Like {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userAvatar: string;
}

interface PostDetailProps {
  post: any;
  comments: Comment[];
  likes: Like[];
  isOpen: boolean;
  onClose: () => void;
  onCommentDeleted: (postId: string, commentId: string) => void;
}

const PostDetailDialog = ({ post, comments, likes, isOpen, onClose, onCommentDeleted }: PostDetailProps) => {
  const [processingCommentId, setProcessingCommentId] = React.useState<string | null>(null);
  
  if (!post) return null;

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Are you sure you want to delete this comment? This action cannot be undone.")) {
      return;
    }
    
    try {
      setProcessingCommentId(commentId);
      console.log(`Attempting to delete comment ${commentId} from post ${post.id}`);
      
      await deleteComment(post.id, commentId);
      
      toast({
        title: "Success",
        description: "Comment deleted successfully.",
      });
      
      // Notify parent component to update state
      if (onCommentDeleted) {
        onCommentDeleted(post.id, commentId);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingCommentId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Post Detail</span>
            <Badge variant={post.isDeleted ? "destructive" : "outline"}>
              {post.isDeleted ? "Hidden" : "Visible"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="flex items-center gap-3 mb-4">
            <Avatar>
              <AvatarImage src={post.userAvatar} alt={post.userName} />
              <AvatarFallback>{post.userName?.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{post.userName}</h3>
              <p className="text-sm text-muted-foreground">
                {post.createdAt ? format(new Date(post.createdAt), 'MMM d, yyyy, h:mm a') : 'Unknown date'}
              </p>
            </div>
          </div>

          <p className="text-base mb-6 whitespace-pre-line">{post.caption}</p>

          {post.images && post.images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {post.images.map((image: string, index: number) => (
                <div key={index} className="relative aspect-square rounded-md overflow-hidden">
                  <img 
                    src={image} 
                    alt={`Post image ${index + 1}`} 
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>
          )}

          <Tabs defaultValue="comments" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="comments">
                Comments ({comments.length})
              </TabsTrigger>
              <TabsTrigger value="likes">
                Likes ({likes.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="comments" className="max-h-[300px] overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No comments yet</p>
              ) : (
                <div className="space-y-4 py-2">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={comment.userAvatar} alt={comment.userName} />
                        <AvatarFallback>{comment.userName?.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{comment.userName}</span>
                            <span className="text-xs text-muted-foreground">
                              {comment.timestamp ? format(new Date(comment.timestamp), 'MMM d, yyyy') : 'Unknown date'}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive h-8 w-8 p-0"
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={processingCommentId === comment.id}
                          >
                            {processingCommentId === comment.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-sm mt-1">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="likes" className="max-h-[300px] overflow-y-auto">
              {likes.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No likes yet</p>
              ) : (
                <div className="space-y-2 py-2">
                  {likes.map((like) => (
                    <div key={like.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={like.userAvatar} alt={like.userName} />
                        <AvatarFallback>{like.userName?.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{like.userName}</p>
                        <p className="text-xs text-muted-foreground">
                          {like.timestamp ? format(new Date(like.timestamp), 'MMM d, yyyy') : 'Unknown date'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};


export const getServerSideProps = async (context) => {
  return {
    props: {}, // Will be passed to the page component as props
  }
};

export default PostDetailDialog;