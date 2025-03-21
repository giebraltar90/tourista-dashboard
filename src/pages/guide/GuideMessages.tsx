
import { Navigate } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useGuideTours } from "@/hooks/useGuideData";

const mockMessages = [
  {
    id: 1,
    sender: "Operations Team",
    message: "Can you arrive 15 minutes early for tomorrow's tour? We have some VIP guests.",
    timestamp: "10:30 AM",
    isFromGuide: false
  },
  {
    id: 2,
    sender: "John Smith",
    message: "No problem, I'll be there early.",
    timestamp: "10:45 AM",
    isFromGuide: true
  },
  {
    id: 3,
    sender: "Operations Team",
    message: "Great, thanks! Let me know if you need anything.",
    timestamp: "11:00 AM",
    isFromGuide: false
  }
];

const GuideMessages = () => {
  const { role, guideView } = useRole();
  const { guideName = "" } = useGuideTours();
  
  // If accessed directly as an operator without guide view, redirect to main dashboard
  if (role === "operator" && !guideView) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-muted-foreground">
            Communications with the operations team
          </p>
        </div>
        
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/50">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <CardTitle>Operations Messages</CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="h-[400px] flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {mockMessages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex ${msg.isFromGuide ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.isFromGuide 
                          ? 'bg-primary text-primary-foreground ml-auto' 
                          : 'bg-muted'
                      }`}
                    >
                      {!msg.isFromGuide && (
                        <p className="text-xs font-semibold mb-1">{msg.sender}</p>
                      )}
                      <p>{msg.message}</p>
                      <p className={`text-xs ${msg.isFromGuide ? 'text-primary-foreground/80' : 'text-muted-foreground'} text-right mt-1`}>
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Type your message..." 
                    className="flex-1"
                  />
                  <Button>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default GuideMessages;
