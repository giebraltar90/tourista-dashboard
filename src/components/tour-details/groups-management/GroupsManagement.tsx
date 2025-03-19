
import { useState } from "react";
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

  // Get dialog management - pass the tour object
  const {
    openAddGroupDialog,
    openDeleteDialog,
    dialogsComponent,
    isAddGroupOpen,
    openAssignGuideDialog
  } = GroupDialogsContainer({
    tour,
    guide1Info,
    guide2Info,
    guide3Info,
    selectedGroupIndex,
    setSelectedGroupIndex
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
            isHighSeason={Boolean(tour.isHighSeason)} 
            totalParticipants={tour.tourGroups?.reduce((sum, group) => sum + (group.size || 0), 0) || 0} 
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
