// src/pages/adminUI/components/PostsManagement/TopPostsTable.tsx

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface TopPost {
  id: string;
  caption: string;
  createdAt: string;
  userName: string;
  userAvatar: string;
  images: string[];
  likesCount: number;
  commentsCount: number;
  totalInteractions: number;
}

interface TopPostsTableProps {
  posts: TopPost[];
  isLoading: boolean;
  onViewDetails: (post: any) => void;
}

const TopPostsTable: React.FC<TopPostsTableProps> = ({
  posts,
  isLoading,
  onViewDetails,
}) => {
  // Helper to truncate long captions
  const truncateCaption = (text: string, maxLength: number = 50) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="text-base font-medium">Top Performing Posts</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-muted-foreground">No data available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Post</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-center">Likes</TableHead>
                  <TableHead className="text-center">Comments</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-right">View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post, index) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex space-x-3">
                        {post.images && post.images.length > 0 ? (
                          <div className="h-10 w-10 rounded-md overflow-hidden flex-shrink-0">
                            <img 
                              src={post.images[0]} 
                              alt="Post thumbnail" 
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                            <span className="text-xs text-muted-foreground">No image</span>
                          </div>
                        )}
                        <div className="max-w-[150px]">
                          <p className="text-sm line-clamp-2">
                            {truncateCaption(post.caption)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={post.userAvatar} alt={post.userName} />
                          <AvatarFallback>{post.userName?.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs">{post.userName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">
                        {post.createdAt 
                          ? format(new Date(post.createdAt), 'MMM d, yyyy') 
                          : 'Unknown date'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-medium">{post.likesCount}</TableCell>
                    <TableCell className="text-center font-medium">{post.commentsCount}</TableCell>
                    <TableCell className="text-center font-medium">{post.totalInteractions}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onViewDetails(post)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View post details</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};


export const getServerSideProps = async (context) => {
  return {
    props: {}, // Will be passed to the page component as props
  }
};

export default TopPostsTable;