
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GroupsTable } from "./GroupsTable";
import { GroupsGrid } from "./GroupsGrid";
import { useGroupManagement } from "@/hooks/group-management";
import { useGuideInfo } from "@/hooks/guides";
import { GroupCapacityAlert } from "./GroupCapacityAlert";
import { GroupCapacityInfo } from "./GroupCapacityInfo";
import { GroupActions } from "./components/GroupActions";
import { GroupDialogsContainer } from "./components/GroupDialogsContainer";
import { VentrataTourGroup } from "@/types/ventrata";
import { calculateTotalParticipants } from "@/hooks/group-management/services/participantService";

interface GroupsManagementProps {
  tour: TourCardProps;
}

export const GroupsManagement = ({ tour }: GroupsManagementProps) => {
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(null);
  
  // Get guide information safely with null checks
  const guide1Info = tour.guide1 ? useGuideInfo(tour.guide1) : null;
  const guide2Info = tour.guide2 ? useGuideInfo(tour.guide2) : null;
  const guide3Info = tour.guide3 ? useGuideInfo(tour.guide3) : null;

  // Ensure tourGroups are properly initialized with participants arrays
  const normalizedTourGroups: VentrataTourGroup[] = Array.isArray(tour.tourGroups) ? tour.tourGroups.map(group => ({
    ...group,
    participants: Array.isArray(group.participants) ? group.participants : []
  })) : [];
  
  // Calculate initial total participants from the normalized groups
  const initialTotalParticipants = calculateTotalParticipants(normalizedTourGroups);

  const {
    localTourGroups,
    selectedParticipant,
    handleMoveParticipant,
    handleDragStart,
    handleDragOver,
    handleDrop,
    setSelectedParticipant,
    isMovePending,
    loadParticipants
  } = useGroupManagement(tour);

  // Load participants data when component mounts
  useEffect(() => {
    if (tour.id) {
      loadParticipants(tour.id);
    }
  }, [tour.id, loadParticipants]);

  // Calculate total participants from localTourGroups
  const totalParticipants = calculateTotalParticipants(localTourGroups);
  
  // Log for debugging synchronization issues
  console.log("GroupsManagement rendering with counts:", {
    initialTotalParticipants,
    currentTotalParticipants: totalParticipants,
    normalizedGroups: normalizedTourGroups.map(g => ({
      name: g.name, 
      size: g.size, 
      childCount: g.childCount
    })),
    localGroups: localTourGroups.map(g => ({
      name: g.name, 
      size: g.size, 
      childCount: g.childCount,
      participantsLength: Array.isArray(g.participants) ? g.participants.length : 'N/A'
    }))
  });

  // Get dialog management - pass the tour object
  const dialogUtils = GroupDialogsContainer({
    tour,
    guide1Info,
    guide2Info,
    guide3Info,
    selectedGroupIndex,
    setSelectedGroupIndex
  });

  const {
    openAddGroupDialog,
    openDeleteDialog,
    openAssignGuideDialog,
    dialogsComponent,
    isAddGroupOpen
  } = dialogUtils;

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
            isHighSeason={Boolean(tour.isHighSeason)} 
            totalParticipants={totalParticipants} 
          />
          
          <GroupCapacityAlert 
            tourGroups={localTourGroups} 
            isHighSeason={Boolean(tour.isHighSeason)} 
          />
          
          <GroupActions 
            onAddGroup={openAddGroupDialog} 
            onDeleteGroup={openDeleteDialog}
            hasSelectedGroup={selectedGroupIndex !== null}
            isHighSeason={Boolean(tour.isHighSeason)}
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
          />
        </div>
      </CardContent>

      {/* Render all dialogs */}
      {dialogsComponent}
    </Card>
  );
};
