
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { useGuideInfo } from "@/hooks/useGuideData";
import { DEFAULT_CAPACITY_SETTINGS } from "@/types/ventrata";
import { GroupCapacityAlert } from "./GroupCapacityAlert";
import { GroupCapacityInfo } from "./GroupCapacityInfo";
import { GroupsList } from "./GroupsList";

interface GroupGuideManagementProps {
  tour: TourCardProps;
}

export const GroupGuideManagement = ({ tour }: GroupGuideManagementProps) => {
  const guide1Info = useGuideInfo(tour.guide1);
  const guide2Info = tour.guide2 ? useGuideInfo(tour.guide2) : null;
  const guide3Info = tour.guide3 ? useGuideInfo(tour.guide3) : null;
  
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
          
          <GroupsList 
            tour={tour}
            guide1Info={guide1Info}
            guide2Info={guide2Info}
            guide3Info={guide3Info}
          />
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
