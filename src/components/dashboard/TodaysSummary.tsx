
import { useState } from "react";
import { format } from "date-fns";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Calendar, Bike, Users, MessageSquare, Clock } from "lucide-react";

// Interface for message data
interface Message {
  id: string;
  sender: string;
  message: string;
  time: string;
  read: boolean;
}

// Interface for today's activities
interface TodayActivity {
  id: string;
  time: string;
  title: string;
  description: string;
  type: 'tour' | 'guide' | 'message';
  status?: 'active' | 'completed' | 'pending';
}

interface TodaysSummaryProps {
  date: Date;
  activities: TodayActivity[];
  messages: Message[];
}

export function TodaysSummary({ date, activities, messages }: TodaysSummaryProps) {
  const [activeTab, setActiveTab] = useState("activities");
  
  const formattedDate = format(date, 'EEEE, MMMM d, yyyy');
  const unreadMessages = messages.filter(msg => !msg.read).length;
  
  const sortedActivities = [...activities].sort((a, b) => {
    // Convert time strings to Date objects for comparison
    const timeA = new Date(`1970/01/01 ${a.time}`);
    const timeB = new Date(`1970/01/01 ${b.time}`);
    return timeA.getTime() - timeB.getTime();
  });
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary" />
            Today's Summary
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {formattedDate}
          </div>
        </div>
      </CardHeader>
      
      <Tabs defaultValue="activities" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full rounded-none bg-muted/50">
          <TabsTrigger value="activities" className="data-[state=active]:bg-background">
            Activities
          </TabsTrigger>
          <TabsTrigger value="messages" className="data-[state=active]:bg-background">
            Messages
            {unreadMessages > 0 && (
              <Badge className="ml-2 bg-primary">{unreadMessages}</Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="activities" className="m-0">
          <CardContent className="p-0">
            <div className="divide-y divide-border/60">
              {sortedActivities.map((activity) => (
                <div 
                  key={activity.id}
                  className="p-4 transition-colors hover:bg-muted/20 flex"
                >
                  <div className="mr-3 relative">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      activity.type === 'tour' ? "bg-primary/10 text-primary" :
                      activity.type === 'guide' ? "bg-green-500/10 text-green-500" :
                      "bg-blue-500/10 text-blue-500"
                    )}>
                      {activity.type === 'tour' ? (
                        <Bike className="h-4 w-4" />
                      ) : activity.type === 'guide' ? (
                        <Users className="h-4 w-4" />
                      ) : (
                        <MessageSquare className="h-4 w-4" />
                      )}
                    </div>
                    <div className="absolute top-8 bottom-0 left-4 w-px bg-border/60"></div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{activity.title}</h4>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {activity.time}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {activity.description}
                    </p>
                    {activity.status && (
                      <Badge 
                        className={cn(
                          "mt-2 font-normal",
                          activity.status === 'active' && "bg-green-500/10 text-green-500 hover:bg-green-500/20",
                          activity.status === 'completed' && "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
                          activity.status === 'pending' && "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                        )}
                      >
                        {activity.status}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              
              {activities.length === 0 && (
                <div className="p-6 text-center text-muted-foreground">
                  No activities scheduled for today.
                </div>
              )}
            </div>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="messages" className="m-0">
          <CardContent className="p-0">
            <div className="divide-y divide-border/60">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={cn(
                    "p-4 transition-colors hover:bg-muted/20",
                    !message.read && "bg-primary/5"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm flex items-center">
                      {message.sender}
                      {!message.read && (
                        <span className="w-2 h-2 rounded-full bg-primary ml-2"></span>
                      )}
                    </h4>
                    <span className="text-xs text-muted-foreground">{message.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {message.message}
                  </p>
                </div>
              ))}
              
              {messages.length === 0 && (
                <div className="p-6 text-center text-muted-foreground">
                  No messages to display.
                </div>
              )}
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
      
      <CardFooter className="p-4 border-t bg-muted/20">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs w-full"
          onClick={() => setActiveTab(activeTab === "activities" ? "messages" : "activities")}
        >
          View {activeTab === "activities" ? "Messages" : "Activities"}
        </Button>
      </CardFooter>
    </Card>
  );
}
