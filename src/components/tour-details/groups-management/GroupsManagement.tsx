
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { PenSquare } from "lucide-react";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GroupsTable } from "./GroupsTable";
import { GroupsGrid } from "./GroupsGrid";
import { useGroupManagement } from "@/hooks/group-management";
import { useGuideInfo, useGuideData } from "@/hooks/guides";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { GuideAssignmentDialog } from "./GuideAssignmentDialog";
import { EditGroupForm } from "./EditGroupForm";
import { getValidGuides } from "./GuideOptionsList";

interface GroupsManagementProps {
  tour: TourCardProps;
}

export const GroupsManagement = ({ tour }: GroupsManagementProps) => {
  const [isAssignGuideOpen, setIsAssignGuideOpen] = useState(false);
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(null);
  const { guides = [] } = useGuideData() || { guides: [] };

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
  
  const handleOpenEditGroup = (groupIndex: number) => {
    setSelectedGroupIndex(groupIndex);
    setIsEditGroupOpen(true);
  };

  // Create an array of valid guides with properly formatted IDs for use in AssignGuideForm
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
            onEditGroup={handleOpenEditGroup}
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
            onEditGroup={handleOpenEditGroup}
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
          onClick={() => handleOpenEditGroup(0)}
        >
          <PenSquare className="mr-2 h-4 w-4" />
          Edit Groups
        </Button>
      </CardFooter>

      {/* Guide Assignment Dialog */}
      <GuideAssignmentDialog
        isOpen={isAssignGuideOpen}
        onOpenChange={setIsAssignGuideOpen}
        selectedGroupIndex={selectedGroupIndex}
        tourId={tour.id}
        tourGroups={localTourGroups}
        validGuides={validGuides}
      />
      
      {/* Edit Group Dialog */}
      <Dialog open={isEditGroupOpen} onOpenChange={setIsEditGroupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
            <DialogDescription>
              Update group name and entry time
            </DialogDescription>
          </DialogHeader>
          {selectedGroupIndex !== null && localTourGroups[selectedGroupIndex] && (
            <EditGroupForm 
              tourId={tour.id}
              group={localTourGroups[selectedGroupIndex]}
              groupIndex={selectedGroupIndex}
              onSuccess={() => setIsEditGroupOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};
