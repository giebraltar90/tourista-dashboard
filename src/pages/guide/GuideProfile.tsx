
import { Navigate } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Mail, Phone, Calendar, MapPin, Clock } from "lucide-react";
import { useGuideTours } from "@/hooks/guides/useGuideTours";

const GuideProfile = () => {
  const { role, guideView } = useRole();
  const { guideName = "" } = useGuideTours();
  
  // If accessed directly as an operator without guide view, redirect to main dashboard
  if (role === "operator" && !guideView) {
    return <Navigate to="/" replace />;
  }
  
  // For demo purposes, we'll create some mock data
  const guideInfo = {
    name: guideName,
    email: `${guideName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
    phone: "+33 6 12 34 56 78",
    location: "Paris, France",
    joinDate: "January 2022",
    guideType: "Staff Guide",
    languages: ["English", "French", "Spanish"],
    specialties: ["City Tours", "Museum Tours", "Food Tours"]
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Guide Profile</h1>
          <p className="text-muted-foreground">
            Your profile and account information
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                    {getInitials(guideInfo.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-medium">{guideInfo.name}</h3>
                  <p className="text-primary">{guideInfo.guideType}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{guideInfo.email}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{guideInfo.phone}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{guideInfo.location}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {guideInfo.joinDate}</span>
                </div>
              </div>
              
              <Button variant="outline" className="w-full">
                <User className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Skills & Expertise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {guideInfo.languages.map(language => (
                    <span 
                      key={language} 
                      className="px-2.5 py-0.5 rounded-full text-xs bg-primary/10 text-primary"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {guideInfo.specialties.map(specialty => (
                    <span 
                      key={specialty} 
                      className="px-2.5 py-0.5 rounded-full text-xs bg-muted text-muted-foreground"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Availability</h3>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Managing your tour schedule
                  </span>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  <Calendar className="h-4 w-4 mr-2" />
                  Update Availability
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GuideProfile;
