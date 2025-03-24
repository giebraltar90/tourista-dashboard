
import { useState, useEffect } from "react";
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
import { useGuideAssignmentCache } from "@/hooks/group-management/useGuideAssignmentCache";

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
  console.log("GroupsManagement rendering with tourId:", tourId);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(null);

  // Get guide assignments from cache
  const { assignments, refreshAssignments } = useGuideAssignmentCache(tourId);

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
  const { isManualRefreshing, handleManualRefresh } = useManualRefresh(() => {
    refreshParticipants();
    refreshAssignments();
  });
  
  // Initial load of participants
  useEffect(() => {
    if (tourId) {
      console.log("GroupsManagement: Initial loading of participants for tour:", tourId);
      // Load participants with the tour ID
      // We need to fetch the group IDs first since loadParticipants expects an array of groupIds or a tourId
      const fetchGroups = async () => {
        try {
          const { data: groups } = await supabase
            .from('tour_groups')
            .select('id')
            .eq('tour_id', tourId);
            
          if (groups && groups.length > 0) {
            const groupIds = groups.map(g => g.id);
            await loadParticipants(groupIds);
          } else {
            console.log("No groups found for this tour");
          }
        } catch (err) {
          console.error("Error fetching groups for loadParticipants:", err);
        }
      };
      
      fetchGroups();
    }
  }, [tourId, loadParticipants]);

  // Sync localTourGroups with guide assignments
  useEffect(() => {
    if (localTourGroups && localTourGroups.length > 0 && assignments.length > 0) {
      // We don't modify localTourGroups directly, but this ensures the correct guide names are displayed
      console.log("Syncing localTourGroups with assignments:", {
        localTourGroups: localTourGroups.map(g => ({ id: g.id, name: g.name })),
        assignments: assignments.map(a => ({ id: a.groupId, guideName: a.guideName }))
      });
    }
  }, [localTourGroups, assignments]);
  
  // Get dialog management - pass the tour object
  const dialogUtils = GroupDialogsContainer({
    tour,
    guide1Info,
    guide2Info,
    guide3Info,
    selectedGroupIndex,
    setSelectedGroupIndex,
    onGuideAssigned: refreshAssignments
  });

  const { dialogsComponent } = dialogUtils;

  const handleOpenAssignGuide = (groupIndex: number) => {
    setSelectedGroupIndex(groupIndex);
    dialogUtils.openAssignGuideDialog(groupIndex);
  };

  // Fix: Create a compatible wrapper function without parameters for handleDragEnd
  const handleDragEndWrapper = () => {
    // Call the original handler with a dummy event or no parameters
    handleDragEnd();
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-2xl font-semibold mb-6">Group & Participant Management</h2>
        
        <div className="space-y-6">
          <GroupsHeader 
            isManualRefreshing={isManualRefreshing}
            isFixingDatabase={isFixingDatabase}
            onManualRefresh={handleManualRefresh}
          />
          
          <DatabaseErrorAlert 
            error={databaseError}
            isFixingDatabase={isFixingDatabase}
            onFixDatabase={handleFixDatabase}
          />
          
          {/* Display the group grid for participant management */}
          {localTourGroups && localTourGroups.length > 0 ? (
            <GroupsGrid 
              tour={tour}
              localTourGroups={localTourGroups}
              guideAssignments={assignments}
              selectedParticipant={selectedParticipant}
              setSelectedParticipant={setSelectedParticipant}
              handleDragStart={handleDragStart}
              handleDragEnd={handleDragEndWrapper}
              handleDragOver={handleDragOver}
              handleDragLeave={handleDragLeave}
              handleDrop={handleDrop}
              handleMoveParticipant={handleMoveParticipant}
              isMovePending={isMovePending}
              onRefreshParticipants={refreshParticipants}
              onOpenAssignGuide={handleOpenAssignGuide}
            />
          ) : (
            <div className="text-center p-6 text-muted-foreground">
              No tour groups available. Try using the "Add Test Participants" button above.
            </div>
          )}
        </div>
      </CardContent>
      
      <GroupsFooter />

      {/* Render all dialogs */}
      {dialogsComponent}
    </Card>
  );
};

// Add missing import
import { supabase } from "@/integrations/supabase/client";
