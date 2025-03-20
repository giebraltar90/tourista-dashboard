
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { useGuideInfo, useGuideData } from "@/hooks/guides";
import { DEFAULT_CAPACITY_SETTINGS } from "@/types/ventrata";
import { useGuideNameInfo } from "@/hooks/group-management/useGuideNameInfo";
import { useState } from "react";
import { GroupCard } from "./GroupCard";
import { AssignGuideDialog } from "./dialogs/AssignGuideDialog";

interface GroupAssignmentProps {
  tour: TourCardProps;
}

export const GroupAssignment = ({ tour }: GroupAssignmentProps) => {
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
  const validGuides = [
    ...(tour.guide1 ? [{ id: "guide1", name: tour.guide1, info: guide1Info }] : []),
    ...(tour.guide2 ? [{ id: "guide2", name: tour.guide2, info: guide2Info }] : []),
    ...(tour.guide3 ? [{ id: "guide3", name: tour.guide3, info: guide3Info }] : []),
    ...(guides ? guides.map(guide => ({
      id: guide.id || "",
      name: guide.name || "",
      info: guide
    })) : [])
  ].filter(guide => guide.name && guide.id);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Group Assignment</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
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
            <h3 className="text-sm font-medium">Current Group Assignments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tour.tourGroups.map((group, index) => {
                const { name: guideName, info: guideInfo } = getGuideNameAndInfo(group.guideId);
                
                return (
                  <GroupCard
                    key={index}
                    group={group}
                    groupIndex={index}
                    tour={tour}
                    guide1Info={guide1Info}
                    guide2Info={guide2Info}
                    guide3Info={guide3Info}
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
          Guides should be assigned to groups based on participant count and capacity requirements.
        </div>
      </CardFooter>

      {selectedGroupIndex !== null && (
        <AssignGuideDialog
          isOpen={isAssignGuideOpen}
          onOpenChange={setIsAssignGuideOpen}
          tourId={tour.id}
          groupIndex={selectedGroupIndex}
          guides={validGuides}
          currentGuideId={tour.tourGroups[selectedGroupIndex]?.guideId}
        />
      )}
    </Card>
  );
};
