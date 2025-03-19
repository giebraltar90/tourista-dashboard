
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Calendar as CalendarIcon, IdCard, User, UserPlus } from "lucide-react";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideInfo } from "@/types/ventrata";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useAssignGuide } from "@/hooks/group-management/useAssignGuide";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useGuideNameInfo } from "@/hooks/group-management/useGuideNameInfo";
import { useState } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";

interface TourOverviewProps {
  tour: TourCardProps;
  guide1Info: GuideInfo | null;
  guide2Info: GuideInfo | null;
  guide3Info: GuideInfo | null;
}

export const TourOverview = ({ tour, guide1Info, guide2Info, guide3Info }: TourOverviewProps) => {
  const totalParticipants = tour.tourGroups.reduce((sum, group) => sum + group.size, 0);
  const totalGroups = tour.tourGroups.length;
  const { assignGuide } = useAssignGuide(tour.id);
  const { getGuideNameAndInfo } = useGuideNameInfo(tour, guide1Info, guide2Info, guide3Info);
  const [isAssigning, setIsAssigning] = useState(false);
  
  const adultTickets = Math.round(tour.numTickets * 0.7) || Math.round(totalParticipants * 0.7);
  const childTickets = (tour.numTickets || totalParticipants) - adultTickets;

  // Function to determine guide type badge color
  const getGuideTypeBadgeColor = (guideType?: string) => {
    if (!guideType) return "bg-gray-100 text-gray-800";
    
    switch (guideType) {
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
  
  // Handler for assigning a guide to a group
  const handleAssignGuide = async (groupIndex: number, guideId: string) => {
    setIsAssigning(true);
    try {
      await assignGuide(groupIndex, guideId);
      toast.success(`Guide assigned to Group ${groupIndex + 1}`);
    } catch (error) {
      console.error("Error assigning guide:", error);
      toast.error("Failed to assign guide");
    } finally {
      setIsAssigning(false);
    }
  };
  
  // Create guide options for the select dropdown
  const guideOptions = [
    { id: "guide1", name: tour.guide1, info: guide1Info },
    ...(tour.guide2 ? [{ id: "guide2", name: tour.guide2, info: guide2Info }] : []),
    ...(tour.guide3 ? [{ id: "guide3", name: tour.guide3, info: guide3Info }] : []),
    { id: "_none", name: "None (Unassigned)", info: null },
  ].filter(guide => guide.name); // Filter out empty names

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tour Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference:</span>
                <span className="font-medium">#{tour.referenceCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <Badge variant="outline" className={
                  tour.tourType === 'food' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                  tour.tourType === 'private' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' :
                  'bg-blue-100 text-blue-800 hover:bg-blue-200'
                }>
                  {tour.tourType === 'food' ? 'Food Tour' : 
                   tour.tourType === 'private' ? 'Private Tour' : 
                   'Standard Tour'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
                  Confirmed
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-medium">{totalParticipants} participants</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Groups:</span>
                <span className="font-medium">{totalGroups} groups</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Capacity:</span>
                <span className="font-medium">
                  {totalParticipants} / {totalGroups > 2 ? '36' : '24'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Adult (18+):</span>
                <span className="font-medium">{adultTickets} tickets</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Child (Under 18):</span>
                <span className="font-medium">{childTickets} tickets</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-medium">
                  {tour.numTickets || totalParticipants} tickets
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Tour Groups & Guides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Group list with guide assignments */}
            {tour.tourGroups.map((group, index) => {
              const { name: guideName, info: guideInfo } = getGuideNameAndInfo(group.guideId);
              
              return (
                <div key={index} className={`p-4 rounded-lg border ${group.guideId ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-base">Group {index + 1}: {group.name}</h3>
                    <Badge variant="outline" className="bg-blue-50">
                      {group.size} participants
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-3 mt-2">
                    <div className={`p-2 rounded-full ${group.guideId ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {group.guideId ? <User className="h-5 w-5 text-green-600" /> : <UserPlus className="h-5 w-5 text-gray-400" />}
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Guide: {guideName !== "Unassigned" ? guideName : "Not assigned"}
                      </p>
                      {guideInfo && (
                        <Badge variant="outline" className={`mt-1 text-xs ${getGuideTypeBadgeColor(guideInfo.guideType)}`}>
                          {guideInfo.guideType}
                        </Badge>
                      )}
                    </div>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button size="sm" variant="outline">
                          Assign Guide
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-3">
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm">Assign Guide to Group {index + 1}</h4>
                          <Select 
                            onValueChange={(value) => handleAssignGuide(index, value)}
                            defaultValue={group.guideId || "_none"}
                            disabled={isAssigning}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select guide" />
                            </SelectTrigger>
                            <SelectContent>
                              {guideOptions.map((guide) => (
                                <SelectItem key={guide.id} value={guide.id}>
                                  {guide.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Guides Assigned</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">{tour.guide1}</h3>
                <p className="text-sm text-muted-foreground">Primary Guide</p>
                
                {guide1Info && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center text-sm">
                      <CalendarIcon className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                      <span>{format(guide1Info.birthday, 'MMMM d, yyyy')}</span>
                    </div>
                    <Badge variant="outline" className={getGuideTypeBadgeColor(guide1Info.guideType)}>
                      <IdCard className="h-3.5 w-3.5 mr-1.5" />
                      {guide1Info.guideType}
                    </Badge>
                  </div>
                )}
                
                {/* Show which group this guide is assigned to */}
                {tour.tourGroups.map((group, index) => {
                  if (group.guideId === "guide1" || group.guideId === tour.guide1) {
                    return (
                      <Badge key={index} className="mt-2 bg-green-100 text-green-800 border-green-300">
                        Assigned to Group {index + 1}
                      </Badge>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
            
            {tour.guide2 && (
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{tour.guide2}</h3>
                  <p className="text-sm text-muted-foreground">Secondary Guide</p>
                  
                  {guide2Info && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center text-sm">
                        <CalendarIcon className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                        <span>{format(guide2Info.birthday, 'MMMM d, yyyy')}</span>
                      </div>
                      <Badge variant="outline" className={getGuideTypeBadgeColor(guide2Info.guideType)}>
                        <IdCard className="h-3.5 w-3.5 mr-1.5" />
                        {guide2Info.guideType}
                      </Badge>
                    </div>
                  )}
                  
                  {/* Show which group this guide is assigned to */}
                  {tour.tourGroups.map((group, index) => {
                    if (group.guideId === "guide2" || (tour.guide2 && group.guideId === tour.guide2)) {
                      return (
                        <Badge key={index} className="mt-2 bg-green-100 text-green-800 border-green-300">
                          Assigned to Group {index + 1}
                        </Badge>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            )}
            
            {tour.guide3 && (
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{tour.guide3}</h3>
                  <p className="text-sm text-muted-foreground">Assistant Guide</p>
                  
                  {guide3Info && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center text-sm">
                        <CalendarIcon className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                        <span>{format(guide3Info.birthday, 'MMMM d, yyyy')}</span>
                      </div>
                      <Badge variant="outline" className={getGuideTypeBadgeColor(guide3Info.guideType)}>
                        <IdCard className="h-3.5 w-3.5 mr-1.5" />
                        {guide3Info.guideType}
                      </Badge>
                    </div>
                  )}
                  
                  {/* Show which group this guide is assigned to */}
                  {tour.tourGroups.map((group, index) => {
                    if (group.guideId === "guide3" || (tour.guide3 && group.guideId === tour.guide3)) {
                      return (
                        <Badge key={index} className="mt-2 bg-green-100 text-green-800 border-green-300">
                          Assigned to Group {index + 1}
                        </Badge>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
