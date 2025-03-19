
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { useGuideInfo, useGuideData } from "@/hooks/guides";
import { DEFAULT_CAPACITY_SETTINGS } from "@/types/ventrata";
import { GroupCapacityAlert } from "./GroupCapacityAlert";
import { GroupCapacityInfo } from "./GroupCapacityInfo";
import { useGuideNameInfo } from "@/hooks/group-management/useGuideNameInfo";
import { useState } from "react";
import { GroupGuideCard } from "./GroupGuideCard";
import { GuideAssignmentDialog } from "./GuideAssignmentDialog";
import { getValidGuides } from "./GuideOptionsList";

interface GroupGuideManagementProps {
  tour: TourCardProps;
}

export const GroupGuideManagement = ({ tour }: GroupGuideManagementProps) => {
  const guide1Info = tour.guide1 ? useGuideInfo(tour.guide1) : null;
  const guide2Info = tour.guide2 ? useGuideInfo(tour.guide2) : null;
  const guide3Info = tour.guide3 ? useGuideInfo(tour.guide3) : null;
  const { guides = [] } = useGuideData() || { guides: [] };
  
  const { getGuideNameAndInfo } = useGuideNameInfo(tour, guide1Info, guide2Info, guide3Info);
  const [isAssignGuideOpen, setIsAssignGuideOpen] = useState(false);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(null);
  
  const isHighSeason = !!tour.isHighSeason;
  const totalParticipants = tour.tourGroups.reduce((sum, group) => sum + group.size, 0);
  
  const requiredGroups = isHighSeason ? 
    DEFAULT_CAPACITY_SETTINGS.highSeasonGroups : 
    DEFAULT_CAPACITY_SETTINGS.standardGroups;
  
  const handleOpenAssignGuide = (groupIndex: number) => {
    setSelectedGroupIndex(groupIndex);
    setIsAssignGuideOpen(true);
  };

  // Get valid guides for guide selection
  const validGuides = getValidGuides({
    tour,
    guide1Info,
    guide2Info,
    guide3Info,
    guides
  });
  
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
                
                return (
                  <GroupGuideCard
                    key={index}
                    index={index}
                    group={group}
                    guideName={guideName}
                    guideInfo={guideInfo}
                    onAssignGuide={handleOpenAssignGuide}
                  />
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

      <GuideAssignmentDialog
        isOpen={isAssignGuideOpen}
        onOpenChange={setIsAssignGuideOpen}
        selectedGroupIndex={selectedGroupIndex}
        tourId={tour.id}
        tourGroups={tour.tourGroups}
        validGuides={validGuides}
      />
    </Card>
  );
};
