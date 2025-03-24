
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRole } from '@/contexts/RoleContext';

// Mock messages for demo purposes
const mockMessages = [
  { id: 1, sender: 'System', content: 'Welcome to the tour management system!', timestamp: '2023-05-01T10:00:00Z' },
  { id: 2, sender: 'Admin', content: 'Please review your assigned tours for next week.', timestamp: '2023-05-02T09:30:00Z' },
  { id: 3, sender: 'Manager', content: 'New tour assignment pending your confirmation.', timestamp: '2023-05-03T14:15:00Z' },
];

const GuideMessages = () => {
  const { role, guideName } = useRole();
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const message = {
      id: messages.length + 1,
      sender: guideName || 'You',
      content: newMessage,
      timestamp: new Date().toISOString(),
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
  };
  
  return (
    <DashboardLayout title="Messages">
      <div className="space-y-6 py-4">
        <Card>
          <CardHeader>
            <CardTitle>Your Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-md h-80 overflow-y-auto p-4">
                {messages.map((message) => (
                  <div key={message.id} className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{message.sender}</span>
                      <span className="text-muted-foreground">
                        {new Date(message.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm">{message.content}</p>
                  </div>
                ))}
              </div>
              
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button type="submit">Send</Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default GuideMessages;
