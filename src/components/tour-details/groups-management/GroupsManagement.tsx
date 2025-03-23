
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GroupsGrid } from "./GroupsGrid";
import { useGroupManagement } from "@/hooks/group-management";
import { GuideInfo } from "@/types/ventrata";
import { useDatabaseCheck } from "./hooks/useDatabaseCheck";
import { useManualRefresh } from "./hooks/useManualRefresh";
import { GroupsHeader } from "./components/GroupsHeader";
import { DatabaseErrorAlert } from "./components/DatabaseErrorAlert";
import { GroupsFooter } from "./components/GroupsFooter";
import { GroupDialogsContainer } from "./components/GroupDialogsContainer";
import { group } from "console";
import { GroupAssignment } from "./group-assignment/GroupAssignment";

interface GroupsManagementProps {
  tour: TourCardProps;
  tourId: string;
  guide1Info?: GuideInfo | null;
  guide2Info?: GuideInfo | null;
  guide3Info?: GuideInfo | null;
}

export const GroupsManagement = ({ 
  tour, 
  tourId,
  guide1Info = null,
  guide2Info = null,
  guide3Info = null
}: GroupsManagementProps) => {
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(null);

  // Get group management hooks and functions
  const {
    localTourGroups,
    selectedParticipant,
    handleMoveParticipant,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    setSelectedParticipant,
    isMovePending,
    loadParticipants,
    refreshParticipants
  } = useGroupManagement(tour);

  // Database check hook
  const { databaseError, isFixingDatabase, handleFixDatabase } = useDatabaseCheck(
    tourId, 
    refreshParticipants
  );
  
  // Manual refresh hook
  const { isManualRefreshing, handleManualRefresh } = useManualRefresh(refreshParticipants);
  
  // Initial load of participants
  useState(() => {
    if (tourId) {
      console.log("GroupsManagement: Initial loading of participants for tour:", tourId);
      // Pass false to prevent showing toast during initial load
      loadParticipants(tourId, false);
    }
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

  const { dialogsComponent } = dialogUtils;

  return (
    <Card>
      <GroupsHeader 
        isManualRefreshing={isManualRefreshing}
        isFixingDatabase={isFixingDatabase}
        onManualRefresh={handleManualRefresh}
      />
      
      <CardContent>
        <div className="space-y-6">
          <DatabaseErrorAlert 
            error={databaseError}
            isFixingDatabase={isFixingDatabase}
            onFixDatabase={handleFixDatabase}
          />
          
          {/* Add the GroupAssignment component for the main group management UI */}
          <GroupAssignment tour={tour} />
          
          {/* Fallback to GroupsGrid if needed */}
          {!tour.tourGroups || tour.tourGroups.length === 0 ? (
            <div className="text-center p-6 text-muted-foreground">
              No tour groups available. Try adding test participants.
            </div>
          ) : (
            <GroupsGrid
              tourGroups={localTourGroups}
              tour={tour}
              guide1Info={guide1Info}
              guide2Info={guide2Info}
              guide3Info={guide3Info}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd} 
              onMoveClick={setSelectedParticipant}
              selectedParticipant={selectedParticipant}
              handleMoveParticipant={handleMoveParticipant}
              isMovePending={isMovePending}
              onRefreshParticipants={refreshParticipants} 
            />
          )}
        </div>
      </CardContent>
      
      <GroupsFooter />

      {/* Render all dialogs */}
      {dialogsComponent}
    </Card>
  );
};
