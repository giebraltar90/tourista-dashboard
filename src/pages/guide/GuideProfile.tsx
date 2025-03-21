
import { Navigate } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useGuideInfo, useGuideTours } from "@/hooks/useGuideData";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar as CalendarIcon, IdCard } from "lucide-react";

const GuideProfile = () => {
  const { role, guideView } = useRole();
  const { guideName = "" } = useGuideTours();
  const guideInfo = useGuideInfo(guideName);
  
  // If accessed directly as an operator without guide view, redirect to main dashboard
  if (role === "operator" && !guideView) {
    return <Navigate to="/" replace />;
  }
  
  const initials = guideName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase();
  
  // Function to determine guide type badge color
  const getGuideTypeBadgeColor = () => {
    if (!guideInfo) return "bg-gray-100 text-gray-800";
    
    switch (guideInfo.guideType) {
      case "GA Ticket":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "GA Free":
        return "bg-green-100 text-green-800 border-green-300";
      case "GC":
        return "bg-purple-100 text-purple-800 border-purple-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Guide Profile</h1>
          <p className="text-muted-foreground">
            View and manage your guide profile
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Profile Info</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarFallback className="text-xl">{initials}</AvatarFallback>
              </Avatar>
              
              <h2 className="text-xl font-semibold">{guideName}</h2>
              <p className="text-muted-foreground mb-2">Tour Guide</p>
              
              {guideInfo && (
                <Badge variant="outline" className={`${getGuideTypeBadgeColor()} mt-1 mb-3`}>
                  <IdCard className="h-3.5 w-3.5 mr-1.5" />
                  {guideInfo.guideType}
                </Badge>
              )}
              
              <Button variant="outline" size="sm" className="mt-2">
                Update Profile Picture
              </Button>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={guideName} readOnly />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" value={`${guideName.toLowerCase().replace(' ', '.')}@boutiquetours.com`} readOnly />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value="+1 (555) 123-4567" readOnly />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="birthday">Birthday</Label>
                  <div className="flex items-center">
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="birthday" 
                      value={guideInfo?.birthday ? format(guideInfo.birthday, 'MMMM d, yyyy') : 'N/A'} 
                      readOnly 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language">Primary Language</Label>
                  <Input id="language" value="English" readOnly />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="guideType">Guide Type</Label>
                  <div className="flex items-center">
                    <IdCard className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="guideType" 
                      value={guideInfo?.guideType || 'N/A'} 
                      readOnly 
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="specializations">Specializations</Label>
                <Input id="specializations" value="City Tours, Historical Sites, Cultural Experiences" readOnly />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="certifications">Certifications</Label>
                <Input id="certifications" value="Licensed City Guide, First Aid Certified" readOnly />
              </div>
              
              {guideInfo && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Guide Type Information</h3>
                  <div className="bg-secondary/20 p-3 rounded-md text-sm">
                    {guideInfo.guideType === "GA Ticket" && (
                      <p>Over 26 years old, requires an adult ticket for Versailles tours, cannot guide inside.</p>
                    )}
                    {guideInfo.guideType === "GA Free" && (
                      <p>Under 26 years old, requires a child's ticket for Versailles tours, cannot guide inside.</p>
                    )}
                    {guideInfo.guideType === "GC" && (
                      <p>Can guide inside Versailles, no ticket needed.</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GuideProfile;
