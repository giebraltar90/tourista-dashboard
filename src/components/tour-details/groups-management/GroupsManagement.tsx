
import { useState, useEffect, useRef } from "react";
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
import { logger } from "@/utils/logger";
import { supabase } from "@/integrations/supabase/client";
import { RequestError } from "@/components/ui/request-error";
import { ensureSyncFunction } from "@/hooks/group-management/services/participantService/syncService";

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
  logger.debug("👥 [GroupsManagement] Rendering with tourId:", tourId);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const initialLoadAttempted = useRef(false);
  
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
    refreshParticipants,
    isLoading,
    error
  } = useGroupManagement(tour);

  // Database check hook
  const { databaseError, isFixingDatabase, handleFixDatabase } = useDatabaseCheck(tourId, refreshParticipants);
  
  // Manual refresh hook with reduced frequency
  const { isManualRefreshing, handleManualRefresh } = useManualRefresh(() => {
    refreshParticipants();
    refreshAssignments();
  }, 10000); // 10 second minimum between manual refreshes
  
  // Ensure sync function exists on component mount
  useEffect(() => {
    ensureSyncFunction();
  }, []);
  
  // Load tour groups first, then participants
  useEffect(() => {
    const loadInitialGroups = async () => {
      try {
        if (!tourId || initialLoadDone || initialLoadAttempted.current) return;
        
        initialLoadAttempted.current = true;
        logger.debug("👥 [GroupsManagement] Initial loading of groups for tour:", tourId);
        
        const { data: groups, error: groupsError } = await supabase
          .from('tour_groups')
          .select('id')
          .eq('tour_id', tourId);
          
        if (groupsError) {
          logger.error("👥 [GroupsManagement] Error fetching groups:", groupsError);
          return;
        }
        
        if (groups && groups.length > 0) {
          const groupIds = groups.map(g => g.id);
          logger.debug("👥 [GroupsManagement] Found groups for tour, loading participants:", groupIds);
          await loadParticipants(groupIds);
          setInitialLoadDone(true);
        } else {
          logger.debug("👥 [GroupsManagement] No groups found for this tour");
          setInitialLoadDone(true);
        }
      } catch (err) {
        logger.error("👥 [GroupsManagement] Error in loadInitialGroups:", err);
        setInitialLoadDone(true);
      }
    };
    
    loadInitialGroups();
  }, [tourId, loadParticipants, initialLoadDone]);
  
  // Get dialog management
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
  
  // Show error if there's a persistent issue
  if (error && !isLoading && !isFixingDatabase) {
    return (
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold mb-6">Group & Participant Management</h2>
          <RequestError 
            title="Error loading participants" 
            message={typeof error === 'string' ? error : 'Failed to load participant data'}
            retryAction={refreshParticipants}
          />
        </CardContent>
      </Card>
    );
  }

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
              {isLoading ? "Loading tour groups..." : "No tour groups available. Try using the \"Add Test Participants\" button above."}
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
