
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { PenSquare } from "lucide-react";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GroupsTable } from "./GroupsTable";
import { GroupsGrid } from "./GroupsGrid";
import { useGroupManagement } from "@/hooks/group-management";
import { useGuideInfo } from "@/hooks/useGuideData";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { AssignGuideForm } from "./AssignGuideForm";

interface GroupsManagementProps {
  tour: TourCardProps;
}

export const GroupsManagement = ({ tour }: GroupsManagementProps) => {
  const [isAssignGuideOpen, setIsAssignGuideOpen] = useState(false);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(null);

  const {
    localTourGroups,
    selectedParticipant,
    handleMoveParticipant,
    handleDragStart,
    handleDragOver,
    handleDrop,
    setSelectedParticipant,
    isMovePending
  } = useGroupManagement(tour);

  // Get guide information
  const guide1Info = tour.guide1 ? useGuideInfo(tour.guide1) : null;
  const guide2Info = tour.guide2 ? useGuideInfo(tour.guide2) : null;
  const guide3Info = tour.guide3 ? useGuideInfo(tour.guide3) : null;

  const handleOpenAssignGuide = (groupIndex: number) => {
    setSelectedGroupIndex(groupIndex);
    setIsAssignGuideOpen(true);
  };

  // Create an array of valid guides with properly formatted IDs for use in AssignGuideForm
  const getValidGuides = () => {
    const guides = [];
    
    // Primary guides - use consistent IDs
    if (tour.guide1) {
      guides.push({ 
        id: "guide1", 
        name: tour.guide1, 
        info: guide1Info 
      });
    }
    
    if (tour.guide2) {
      guides.push({ 
        id: "guide2", 
        name: tour.guide2, 
        info: guide2Info 
      });
    }
    
    if (tour.guide3) {
      guides.push({ 
        id: "guide3", 
        name: tour.guide3, 
        info: guide3Info 
      });
    }
    
    // Filter out any guides with empty names or IDs
    return guides.filter(guide => guide.name && guide.id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Group Management</CardTitle>
        <CardDescription>Details of participant groups and their assignments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <GroupsTable 
            tourGroups={localTourGroups} 
            tour={tour}
            guide1Info={guide1Info}
            guide2Info={guide2Info}
            guide3Info={guide3Info}
            onAssignGuide={handleOpenAssignGuide}
          />
          
          <Separator className="my-4" />
          
          <GroupsGrid
            tourGroups={localTourGroups}
            tour={tour}
            guide1Info={guide1Info}
            guide2Info={guide2Info}
            guide3Info={guide3Info}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragStart={handleDragStart}
            onMoveClick={setSelectedParticipant}
            selectedParticipant={selectedParticipant}
            handleMoveParticipant={handleMoveParticipant}
            isMovePending={isMovePending}
            onAssignGuide={handleOpenAssignGuide}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4">
        <div className="text-sm text-muted-foreground">
          Group division is based on families or couples + singles and further divided into adults + children.
        </div>
        <Button 
          variant="outline" 
          size="sm"
        >
          <PenSquare className="mr-2 h-4 w-4" />
          Edit Groups
        </Button>
      </CardFooter>

      <Dialog open={isAssignGuideOpen} onOpenChange={setIsAssignGuideOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Guide to Group</DialogTitle>
            <DialogDescription>
              Choose a guide to assign to this group
            </DialogDescription>
          </DialogHeader>
          {selectedGroupIndex !== null && localTourGroups[selectedGroupIndex] && (
            <AssignGuideForm 
              tourId={tour.id}
              groupIndex={selectedGroupIndex}
              guides={getValidGuides()}
              currentGuideId={localTourGroups[selectedGroupIndex].guideId || "_none"}
              onSuccess={() => setIsAssignGuideOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};
