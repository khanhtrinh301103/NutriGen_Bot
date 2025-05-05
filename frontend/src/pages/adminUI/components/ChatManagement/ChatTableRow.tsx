// frontend/src/pages/adminUI/components/chatManagement/ChatTableRow.tsx
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { format } from 'date-fns';

interface ChatTableRowProps {
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
  onDelete: (chatId: string) => void;
  onExport: (chatId: string) => void;
}

const ChatTableRow: React.FC<ChatTableRowProps> = ({ chat, onView, onDelete, onExport }) => {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <div className="flex h-full w-full items-center justify-center bg-green-100 text-green-800 font-medium">
              {chat.userName.charAt(0)}
            </div>
          </Avatar>
          <div>
            <p className="font-medium">{chat.userName}</p>
            <p className="text-xs text-gray-500">{chat.userEmail}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="max-w-[200px] truncate">
        {chat.topic}
      </TableCell>
      <TableCell>
        {format(chat.startDate, 'MMM d, yyyy h:mm a')}
      </TableCell>
      <TableCell>
        {format(chat.lastMessageDate, 'MMM d, yyyy h:mm a')}
      </TableCell>
      <TableCell>
        {chat.messagesCount}
      </TableCell>
      <TableCell>
        <Badge 
          variant="outline" 
          className={chat.status === 'active' 
            ? 'bg-green-100 text-green-800 hover:bg-green-100' 
            : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
          }
        >
          {chat.status === 'active' ? 'Active' : 'Closed'}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => onView(chat.id)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => onExport(chat.id)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50" 
            onClick={() => onDelete(chat.id)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};


export const getServerSideProps = async (context) => {
  return {
    props: {}, // Will be passed to the page component as props
  }
};

export default ChatTableRow;