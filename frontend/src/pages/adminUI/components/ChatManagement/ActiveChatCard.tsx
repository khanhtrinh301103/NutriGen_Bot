// frontend/src/pages/adminUI/components/chatManagement/ActiveChatCard.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { format } from 'date-fns';

interface ActiveChatCardProps {
  chat: {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    startDate: Date;
    lastMessageDate: Date;
    messagesCount: number;
    status: string;
    topic: string;
  };
  onView: (chatId: string) => void;
  onResume: (chatId: string) => void;
}

const ActiveChatCard: React.FC<ActiveChatCardProps> = ({ chat, onView, onResume }) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <div className="flex h-full w-full items-center justify-center bg-green-100 text-green-800 font-medium">
                {chat.userName.charAt(0)}
              </div>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{chat.userName}</CardTitle>
              <CardDescription>{chat.userEmail}</CardDescription>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className="bg-green-100 text-green-800 hover:bg-green-100"
          >
            Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Topic</p>
              <p className="font-medium">{chat.topic}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Messages</p>
              <p className="font-medium text-center">{chat.messagesCount}</p>
            </div>
          </div>
          
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Started</p>
              <p className="font-medium">{format(chat.startDate, 'MMM d, yyyy h:mm a')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Activity</p>
              <p className="font-medium">{format(chat.lastMessageDate, 'MMM d, yyyy h:mm a')}</p>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => onView(chat.id)}
            >
              View Chat
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              size="sm"
              onClick={() => onResume(chat.id)}
            >
              Resume Chat
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveChatCard;