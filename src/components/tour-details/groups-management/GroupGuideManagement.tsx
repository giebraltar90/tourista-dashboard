
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Users, UserPlus } from "lucide-react";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { useGuideInfo } from "@/hooks/useGuideData";
import { DEFAULT_CAPACITY_SETTINGS } from "@/types/ventrata";
import { GroupCapacityAlert } from "./GroupCapacityAlert";
import { GroupCapacityInfo } from "./GroupCapacityInfo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGuideNameInfo } from "@/hooks/group-management";

interface GroupGuideManagementProps {
  tour: TourCardProps;
}

export const GroupGuideManagement = ({ tour }: GroupGuideManagementProps) => {
  const guide1Info = useGuideInfo(tour.guide1);
  const guide2Info = tour.guide2 ? useGuideInfo(tour.guide2) : null;
  const guide3Info = tour.guide3 ? useGuideInfo(tour.guide3) : null;
  
  const { getGuideNameAndInfo } = useGuideNameInfo(tour, guide1Info, guide2Info, guide3Info);
  
  const isHighSeason = tour.isHighSeason ?? false;
  const totalParticipants = tour.tourGroups.reduce((sum, group) => sum + group.size, 0);
  
  const requiredGroups = isHighSeason ? 
    DEFAULT_CAPACITY_SETTINGS.highSeasonGroups : 
    DEFAULT_CAPACITY_SETTINGS.standardGroups;
  
  return (
    <Card>
      <CardHeader>
        <GroupCapacityInfo 
          tour={tour} 
          isHighSeason={isHighSeason} 
          totalParticipants={totalParticipants} 
        />
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Add the GroupCapacityAlert component */}
          <GroupCapacityAlert 
            tourGroups={tour.tourGroups} 
            isHighSeason={isHighSeason} 
          />
          
          {tour.tourGroups.length < requiredGroups && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {isHighSeason
                  ? `High season requires ${requiredGroups} groups, but you only have ${tour.tourGroups.length}. Please add more groups.`
                  : `Standard capacity requires ${requiredGroups} groups, but you only have ${tour.tourGroups.length}. Please add more groups.`
                }
              </AlertDescription>
            </Alert>
          )}
          
          <Separator />
          
          {/* Display tour groups with their assigned guides */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-medium">Current Guide Assignments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tour.tourGroups.map((group, index) => {
                const { name: guideName, info: guideInfo } = getGuideNameAndInfo(group.guideId);
                const isGuideAssigned = !!group.guideId && guideName !== "Unassigned";
                
                return (
                  <div key={index} className={`p-4 rounded-lg border ${isGuideAssigned ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Group {index + 1}: {group.name}</h4>
                      <Badge variant="outline" className="bg-blue-50">
                        {group.size} participants
                      </Badge>
                    </div>
                    
                    <div className="flex items-center mt-2">
                      <div className={`p-2 rounded-full ${isGuideAssigned ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {isGuideAssigned ? <Users className="h-4 w-4 text-green-600" /> : <UserPlus className="h-4 w-4 text-gray-400" />}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm">
                          Guide: {isGuideAssigned ? (
                            <Badge variant="outline" className="ml-1 bg-green-100 text-green-800">
                              {guideName}
                              {guideInfo?.guideType && <span className="ml-1">({guideInfo.guideType})</span>}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="ml-1 bg-yellow-100 text-yellow-800">
                              Unassigned
                            </Badge>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t p-4">
        <div className="text-sm text-muted-foreground">
          Groups should be balanced and guides assigned based on capacity requirements.
        </div>
      </CardFooter>
    </Card>
  );
};
