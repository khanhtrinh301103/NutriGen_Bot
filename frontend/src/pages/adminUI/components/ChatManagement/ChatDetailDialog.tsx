// frontend/src/pages/adminUI/components/ChatManagement/ChatDetailDialog.tsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import ChatDetailMessage from './ChatDetailMessage';
import { getChatDetails, updateChatStatus, exportChatData } from '../../../../api/adminAPI/adminChatManagementService';

interface ChatDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chat: any;
}

const ChatDetailDialog: React.FC<ChatDetailDialogProps> = ({ 
  open, 
  onOpenChange,
  chat
}) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [chatDetails, setChatDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch chat details when dialog opens
  useEffect(() => {
    const fetchChatDetails = async () => {
      if (open && chat) {
        try {
          setLoading(true);
          setError(null);
          const details = await getChatDetails(chat.id);
          setChatDetails(details);
          setLoading(false);
        } catch (err) {
          console.error('❌ [ChatDetailDialog] Error fetching chat details:', err);
          setError('Failed to load chat details. Please try again.');
          setLoading(false);
        }
      }
    };
    
    fetchChatDetails();
  }, [open, chat]);
  
  if (!chat) return null;
  
  const handleExportChat = async () => {
    try {
      console.log(`📤 [ChatDetailDialog] Exporting chat: ${chat.id}`);
      const exportData = await exportChatData(chat.id);
      
      // Create JSON file and download
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `chat_${chat.id}_export.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (err) {
      console.error('❌ [ChatDetailDialog] Error exporting chat:', err);
      alert('Failed to export chat. Please try again.');
    }
  };

  const handleCloseChat = async () => {
    try {
      console.log(`🔒 [ChatDetailDialog] Closing chat: ${chat.id}`);
      await updateChatStatus(chat.id, 'closed');
      
      // Update local state
      setChatDetails({
        ...chatDetails,
        status: 'closed'
      });
      
      // Inform parent component about status change
      if (chat && typeof chat.onStatusChange === 'function') {
        chat.onStatusChange(chat.id, 'closed');
      }
    } catch (err) {
      console.error('❌ [ChatDetailDialog] Error closing chat:', err);
      alert('Failed to close chat. Please try again.');
    }
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
        
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-red-500">{error}</div>
          </div>
        ) : (
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
                  {chatDetails?.messages && chatDetails.messages.length > 0 ? (
                    chatDetails.messages.map(message => (
                      <ChatDetailMessage 
                        key={message.id}
                        message={message}
                        userName={chat.userName}
                      />
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-6">
                      No messages in this chat.
                    </div>
                  )}
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
                        <p className="font-medium">{chat.userName || 'Not available'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{chat.userEmail || 'Not available'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">User ID</p>
                        <p className="font-medium">{chat.userId || 'Not available'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Member Since</p>
                        <p className="font-medium">
                          {chatDetails?.userDetails?.createdAt 
                            ? typeof chatDetails.userDetails.createdAt.toDate === 'function'
                              ? format(chatDetails.userDetails.createdAt.toDate(), 'MMM d, yyyy')
                              : chatDetails.userDetails.createdAt instanceof Date 
                                ? format(chatDetails.userDetails.createdAt, 'MMM d, yyyy')
                                : typeof chatDetails.userDetails.createdAt === 'string'
                                  ? format(new Date(chatDetails.userDetails.createdAt), 'MMM d, yyyy')
                                  : 'Not available'
                            : 'Not available'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {chatDetails?.userDetails?.healthProfile && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Health Profile</h4>
                      <Separator className="my-2" />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Diet Preferences</p>
                          <p className="font-medium">
                            {chatDetails.userDetails.healthProfile.dietaryRestrictions?.join(', ') || 'None specified'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Allergies</p>
                          <p className="font-medium">
                            {chatDetails.userDetails.healthProfile.allergies?.join(', ') || 'None specified'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Activity Level</p>
                          <p className="font-medium">
                            {chatDetails.userDetails.healthProfile.activityLevel || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Health Goal</p>
                          <p className="font-medium">
                            {chatDetails.userDetails.healthProfile.goal || 'Not specified'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {chatDetails?.userDetails?.savedRecipes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Saved Recipes</h4>
                      <Separator className="my-2" />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Number of Saved Recipes</p>
                          <p className="font-medium">
                            {Object.keys(chatDetails.userDetails.savedRecipes).length || 0}
                          </p>
                        </div>
                        {Object.keys(chatDetails.userDetails.savedRecipes).length > 0 && (
                          <div>
                            <p className="text-sm text-gray-500">Recent Recipe</p>
                            <p className="font-medium">
                              {chatDetails.userDetails.savedRecipes[0]?.title || 'N/A'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Interaction History</h4>
                    <Separator className="my-2" />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Total Messages</p>
                        <p className="font-medium">{chat.messagesCount || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Last Activity</p>
                        <p className="font-medium">{format(chat.lastMessageDate, 'MMM d, yyyy h:mm a')}</p>
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
                    <p className="text-xl font-bold">
                      {(() => {
                        const start = new Date(chat.startDate);
                        const end = new Date(chat.lastMessageDate);
                        const diffMs = end.getTime() - start.getTime();
                        const diffMins = Math.round(diffMs / 60000);
                        return `${diffMins} min`;
                      })()}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="text-xl font-bold" style={{ color: chat.status === 'active' ? '#16a34a' : '#4b5563' }}>
                      {chat.status === 'active' ? 'Active' : 'Closed'}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-500">User</p>
                    <p className="text-xl font-bold truncate">{chat.userName}</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {chatDetails?.messages && chatDetails.messages.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Message Distribution</h4>
                      <div className="bg-gray-50 p-4 rounded-lg h-40">
                        <div className="flex h-full">
                          {/* User messages */}
                          <div 
                            className="bg-blue-500 h-full flex items-end justify-center"
                            style={{ 
                              width: `${chatDetails.messages.filter(m => !m.isAdmin).length / chatDetails.messages.length * 100}%` 
                            }}
                          >
                            <div className="text-white font-bold">
                              {chatDetails.messages.filter(m => !m.isAdmin).length}
                            </div>
                          </div>
                          {/* Admin messages */}
                          <div 
                            className="bg-green-500 h-full flex items-end justify-center"
                            style={{ 
                              width: `${chatDetails.messages.filter(m => m.isAdmin).length / chatDetails.messages.length * 100}%` 
                            }}
                          >
                            <div className="text-white font-bold">
                              {chatDetails.messages.filter(m => m.isAdmin).length}
                            </div>
                          </div>
                        </div>
                        <div className="flex text-xs mt-2">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-500 mr-1"></div>
                            <span>User</span>
                          </div>
                          <div className="flex items-center ml-4">
                            <div className="w-3 h-3 bg-green-500 mr-1"></div>
                            <span>Admin</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {chatDetails?.messages && chatDetails.messages.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          // Extract common keywords from messages
                          const text = chatDetails.messages
                            .map(msg => msg.text)
                            .join(' ')
                            .toLowerCase();
                          
                          // Very simple keyword extraction
                          const commonWords = ['diet', 'food', 'meal', 'recipe', 'nutrition', 'health', 'weight', 'protein', 'carbs', 'fat'];
                          return commonWords
                            .filter(word => text.includes(word))
                            .map(word => (
                              <Badge key={word} variant="outline" className="bg-gray-100">
                                {word}
                              </Badge>
                            ));
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
        
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