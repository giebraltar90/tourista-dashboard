
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GroupsTable } from "./GroupsTable";
import { GroupsGrid } from "./GroupsGrid";
import { useGroupManagement } from "@/hooks/group-management";
import { useGuideInfo, useGuideData } from "@/hooks/guides";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { GuideAssignmentDialog } from "./GuideAssignmentDialog";
import { EditGroupForm } from "./EditGroupForm";
import { getValidGuides } from "./GuideOptionsList";
import { GroupCapacityAlert } from "./GroupCapacityAlert";
import { GroupCapacityInfo } from "./GroupCapacityInfo";
import { useUpdateTourGroups } from "@/hooks/useTourData";

interface GroupsManagementProps {
  tour: TourCardProps;
}

export const GroupsManagement = ({ tour }: GroupsManagementProps) => {
  const [isAssignGuideOpen, setIsAssignGuideOpen] = useState(false);
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(null);
  const { guides = [] } = useGuideData() || { guides: [] };
  const { updateTourGroups } = useUpdateTourGroups();

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

  // Check if groups need to be automatically split (15 or more total participants)
  useEffect(() => {
    if (!tour.tourGroups || tour.tourGroups.length === 0) return;
    
    // Calculate total participants across all groups
    const totalParticipants = tour.tourGroups.reduce((sum, group) => {
      return sum + (group.size || 0);
    }, 0);
    
    // If 15+ participants but only one group, split into two groups
    if (totalParticipants >= 15 && tour.tourGroups.length === 1) {
      console.log("Auto-splitting groups due to 15+ participants");
      
      const currentGroup = tour.tourGroups[0];
      const participants = currentGroup.participants || [];
      
      if (participants.length >= 2) {
        // Calculate roughly half the participants for each group
        const midPoint = Math.ceil(participants.length / 2);
        
        // Create two groups with participants split between them
        const group1Participants = participants.slice(0, midPoint);
        const group2Participants = participants.slice(midPoint);
        
        // Calculate sizes and child counts for each group
        const group1Size = group1Participants.reduce((sum, p) => sum + (p.count || 1), 0);
        const group2Size = group2Participants.reduce((sum, p) => sum + (p.count || 1), 0);
        
        const group1ChildCount = group1Participants.reduce((sum, p) => sum + (p.childCount || 0), 0);
        const group2ChildCount = group2Participants.reduce((sum, p) => sum + (p.childCount || 0), 0);
        
        // Create the new groups
        const newGroups = [
          {
            ...currentGroup,
            name: `Group 1`,
            participants: group1Participants,
            size: group1Size,
            childCount: group1ChildCount
          },
          {
            ...currentGroup,
            id: undefined, // Will be assigned by the backend
            name: `Group 2`,
            participants: group2Participants,
            size: group2Size,
            childCount: group2ChildCount,
            guideId: tour.guide2 ? tour.guide2 : undefined // Assign second guide if available
          }
        ];
        
        // Update tour groups
        updateTourGroups(tour.id, newGroups);
      }
    }
  }, [tour.id, tour.tourGroups]);

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
          <GroupCapacityInfo 
            tour={tour} 
            isHighSeason={!!tour.isHighSeason} 
            totalParticipants={tour.tourGroups?.reduce((sum, group) => sum + (group.size || 0), 0) || 0} 
          />
          
          <GroupCapacityAlert 
            tourGroups={localTourGroups} 
            isHighSeason={!!tour.isHighSeason} 
          />
          
          <GroupsTable 
            tourGroups={localTourGroups} 
            tour={tour}
            guide1Info={guide1Info}
            guide2Info={guide2Info}
            guide3Info={guide3Info}
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
