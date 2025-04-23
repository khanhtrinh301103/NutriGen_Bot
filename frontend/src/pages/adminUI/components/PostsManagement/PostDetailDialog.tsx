// src/pages/adminUI/components/PostsManagement/PostDetailDialog.tsx

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

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
}

const PostDetailDialog = ({ post, comments, likes, isOpen, onClose }: PostDetailProps) => {
  if (!post) return null;

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
              <AvatarFallback>{post.userName.slice(0, 2).toUpperCase()}</AvatarFallback>
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
                        <AvatarFallback>{comment.userName.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{comment.userName}</span>
                          <span className="text-xs text-muted-foreground">
                            {comment.timestamp ? format(new Date(comment.timestamp), 'MMM d, yyyy') : 'Unknown date'}
                          </span>
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
                        <AvatarFallback>{like.userName.slice(0, 2).toUpperCase()}</AvatarFallback>
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

export default PostDetailDialog;