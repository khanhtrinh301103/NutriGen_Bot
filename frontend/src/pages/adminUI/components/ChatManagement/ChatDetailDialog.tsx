// frontend/src/pages/adminUI/components/chatManagement/ChatDetailDialog.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import ChatDetailMessage from './ChatDetailMessage';

// Dữ liệu mẫu cho tin nhắn - sau này sẽ được lấy từ API dựa trên chatId
const MOCK_MESSAGES = [
  {
    id: '1',
    senderId: 'user123',
    text: 'Hello, I need help with planning a diet for diabetes.',
    timestamp: new Date(2025, 3, 15, 9, 30),
    isAdmin: false
  },
  {
    id: '2',
    senderId: 'admin',
    text: 'Hello! I\'d be happy to help you with a diet plan for diabetes. Could you tell me a bit more about your current diet and any specific dietary restrictions you have?',
    timestamp: new Date(2025, 3, 15, 9, 32),
    isAdmin: true
  },
  {
    id: '3',
    senderId: 'user123',
    text: 'I\'m currently trying to avoid high carb foods, but I\'m not sure what else I should be avoiding. I also have a dairy allergy.',
    timestamp: new Date(2025, 3, 15, 9, 35),
    isAdmin: false
  },
  {
    id: '4',
    senderId: 'admin',
    text: 'Thanks for sharing. For diabetes management with a dairy allergy, you\'ll want to focus on low-glycemic foods while avoiding dairy products. Here are some recommendations:\n\n1. Lean proteins like chicken, fish, and tofu\n2. Non-starchy vegetables\n3. Limited whole grains\n4. Healthy fats like avocados and nuts\n5. Plant-based milk alternatives\n\nWould you like a sample meal plan based on these guidelines?',
    timestamp: new Date(2025, 3, 15, 9, 40),
    isAdmin: true
  },
  {
    id: '5',
    senderId: 'user123',
    text: 'Yes, that would be very helpful! I\'d like a 3-day meal plan if possible.',
    timestamp: new Date(2025, 3, 15, 9, 42),
    isAdmin: false
  }
];

interface ChatDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  } | null;
}

const ChatDetailDialog: React.FC<ChatDetailDialogProps> = ({ 
  open, 
  onOpenChange,
  chat
}) => {
  const [activeTab, setActiveTab] = useState('chat');
  
  if (!chat) return null;
  
  const handleExportChat = () => {
    console.log(`📤 [ChatDetailDialog] Exporting chat: ${chat.id}`);
    // Implement chat export functionality
  };

  const handleCloseChat = () => {
    console.log(`🔒 [ChatDetailDialog] Closing chat: ${chat.id}`);
    // Implement close chat functionality
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-medium">
                {chat.userName.charAt(0)}
              </div>
              <div>
                <DialogTitle>{chat.userName}</DialogTitle>
                <DialogDescription>{chat.userEmail}</DialogDescription>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={chat.status === 'active' 
                ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
              }
            >
              {chat.status === 'active' ? 'Active' : 'Closed'}
            </Badge>
          </div>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b mb-4">
            <div className="flex">
              <button 
                className={`px-4 py-2 ${activeTab === 'chat' ? 'border-b-2 border-green-500 font-medium' : 'text-gray-500'}`}
                onClick={() => setActiveTab('chat')}
              >
                Chat History
              </button>
              <button 
                className={`px-4 py-2 ${activeTab === 'info' ? 'border-b-2 border-green-500 font-medium' : 'text-gray-500'}`}
                onClick={() => setActiveTab('info')}
              >
                User Info
              </button>
              <button 
                className={`px-4 py-2 ${activeTab === 'analytics' ? 'border-b-2 border-green-500 font-medium' : 'text-gray-500'}`}
                onClick={() => setActiveTab('analytics')}
              >
                Chat Analytics
              </button>
            </div>
          </div>
          
          {/* Chat History Tab */}
          <TabsContent value="chat" className="flex-1 overflow-auto flex flex-col space-y-4">
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <span className="text-sm text-gray-500">Topic:</span>
                <span className="ml-2 font-medium">{chat.topic}</span>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-500">Started:</span>
                <span className="ml-2 font-medium">{format(chat.startDate, 'MMM d, yyyy h:mm a')}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Messages:</span>
                <span className="ml-2 font-medium">{chat.messagesCount}</span>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-500">Last Active:</span>
                <span className="ml-2 font-medium">{format(chat.lastMessageDate, 'MMM d, yyyy h:mm a')}</span>
              </div>
            </div>
            
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto border rounded-lg bg-white">
              <div className="p-4 space-y-6">
                {MOCK_MESSAGES.map(message => (
                  <ChatDetailMessage 
                    key={message.id}
                    message={message}
                    userName={chat.userName}
                  />
                ))}
              </div>
            </div>
          </TabsContent>
          
          {/* User Info Tab */}
          <TabsContent value="info" className="flex-1 overflow-auto">
            <div className="bg-white p-6 rounded-lg border h-full">
              <h3 className="text-lg font-medium mb-4">User Information</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Personal Details</h4>
                  <Separator className="my-2" />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{chat.userName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{chat.userEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">User ID</p>
                      <p className="font-medium">{chat.userId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p className="font-medium">April 10, 2025</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Health Profile</h4>
                  <Separator className="my-2" />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Diet Preferences</p>
                      <p className="font-medium">Low-carb, Dairy-free</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Allergies</p>
                      <p className="font-medium">Dairy</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Health Conditions</p>
                      <p className="font-medium">Diabetes</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Fitness Goals</p>
                      <p className="font-medium">Weight maintenance</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Interaction History</h4>
                  <Separator className="my-2" />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Total Chats</p>
                      <p className="font-medium">5</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Saved Recipes</p>
                      <p className="font-medium">12</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Login</p>
                      <p className="font-medium">April 15, 2025</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Average Response Time</p>
                      <p className="font-medium">3 minutes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Chat Analytics Tab */}
          <TabsContent value="analytics" className="flex-1 overflow-auto">
            <div className="bg-white p-6 rounded-lg border h-full">
              <h3 className="text-lg font-medium mb-4">Chat Analytics</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Messages</p>
                  <p className="text-xl font-bold">{chat.messagesCount}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="text-xl font-bold">75 min</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Response Time</p>
                  <p className="text-xl font-bold">2.5 min</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Sentiment</p>
                  <p className="text-xl font-bold text-green-600">Positive</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Message Distribution</h4>
                  <div className="bg-gray-50 p-4 rounded-lg h-40 flex items-center justify-center">
                    <p className="text-sm text-gray-500">Message distribution chart would be displayed here</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-gray-100">diabetes</Badge>
                    <Badge variant="outline" className="bg-gray-100">diet</Badge>
                    <Badge variant="outline" className="bg-gray-100">dairy-free</Badge>
                    <Badge variant="outline" className="bg-gray-100">meal plan</Badge>
                    <Badge variant="outline" className="bg-gray-100">carbs</Badge>
                    <Badge variant="outline" className="bg-gray-100">recipes</Badge>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex justify-between">
          <div>
            {chat.status === 'active' && (
              <Button 
                variant="outline" 
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={handleCloseChat}
              >
                Close Chat
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleExportChat}
            >
              Export Chat
            </Button>
            <Button 
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChatDetailDialog;