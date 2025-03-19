
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { 
  Plus, 
  FileText, 
  MessageSquare, 
  Users, 
  Ticket,
  Calendar,
  ChevronRight,
  Mail
} from "lucide-react";

export function QuickActions() {
  const actions = [
    {
      title: "Add New Tour",
      icon: Plus,
      description: "Create a new tour booking",
      link: "/tours/new"
    },
    {
      title: "Generate Report",
      icon: FileText,
      description: "Create operational reports",
      link: "/reports"
    },
    {
      title: "Assign Guides",
      icon: Users,
      description: "Manage guide assignments",
      link: "/guides/assign"
    },
    {
      title: "Send Messages",
      icon: MessageSquare,
      description: "Communicate with staff",
      link: "/messages/new"
    },
    {
      title: "Manage Tickets",
      icon: Ticket,
      description: "Update ticket information",
      link: "/tickets"
    },
    {
      title: "Schedule Tour",
      icon: Calendar,
      description: "Plan upcoming tours",
      link: "/tours/schedule"
    }
  ];
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            className="h-auto flex flex-col items-center justify-center py-4 px-2 hover:bg-muted/50 bg-transparent border-dashed border-border transition-all duration-300 hover:border-primary/50"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <action.icon className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-medium">{action.title}</span>
            <span className="text-xs text-muted-foreground mt-1 text-center">
              {action.description}
            </span>
          </Button>
        ))}
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="text-xs text-muted-foreground">
          Streamline your operations with quick shortcuts
        </div>
        <Button variant="ghost" size="sm" className="text-xs flex items-center">
          View All
          <ChevronRight className="ml-1 h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  );
}
