
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
import { GroupGuideManagement } from "./GroupGuideManagement";

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
  useEffect(() => {
    if (tourId) {
      console.log("GroupsManagement: Initial loading of participants for tour:", tourId);
      // Pass false to prevent showing toast during initial load
      loadParticipants(false);
    }
  }, [tourId, loadParticipants]);
  
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

  const handleOpenAssignGuide = (groupIndex: number) => {
    setSelectedGroupIndex(groupIndex);
    dialogUtils.openAssignGuideDialog(groupIndex);
  };

  // Properly handle the event parameter for drag end
  const handleDragEndWrapper = (e: React.DragEvent<Element>) => {
    handleDragEnd(e);
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
          
          {/* Group guide management component without the capacity section */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Guide Assignments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.isArray(localTourGroups) && localTourGroups.map((group, index) => (
                <div 
                  key={index}
                  className="p-4 bg-muted rounded-lg"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{group.name || `Group ${index + 1}`}</h4>
                    <button 
                      className="text-primary text-sm"
                      onClick={() => handleOpenAssignGuide(index)}
                    >
                      {group.guideId ? "Change Guide" : "Assign Guide"}
                    </button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {group.guideId ? (
                      <span>Guide assigned: {group.guideName || "Unknown Guide"}</span>
                    ) : (
                      <span>No guide assigned</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      
      <GroupsFooter />

      {/* Render all dialogs */}
      {dialogsComponent}
    </Card>
  );
};
