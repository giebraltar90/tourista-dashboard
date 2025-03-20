
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { useGuideInfo, useGuideData } from "@/hooks/guides";
import { useGuideNameInfo } from "@/hooks/group-management/useGuideNameInfo";
import { useState, useEffect, useMemo } from "react";
import { GroupCard } from "./GroupCard";
import { AssignGuideDialog } from "./dialogs/AssignGuideDialog";
import { isValidUuid } from "@/services/api/utils/guidesUtils";
import { useGroupManagement } from "@/hooks/group-management";
import { MoveParticipantSheet } from "./MoveParticipantSheet";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface GroupAssignmentProps {
  tour: TourCardProps;
}

export const GroupAssignment = ({ tour }: GroupAssignmentProps) => {
  console.log("GroupAssignment rendering with tour:", tour);
  
  const guide1Info = tour.guide1 ? useGuideInfo(tour.guide1) : null;
  const guide2Info = tour.guide2 ? useGuideInfo(tour.guide2) : null;
  const guide3Info = tour.guide3 ? useGuideInfo(tour.guide3) : null;
  const { guides = [] } = useGuideData() || { guides: [] };
  
  const { getGuideNameAndInfo } = useGuideNameInfo(tour, guide1Info, guide2Info, guide3Info);
  const [isAssignGuideOpen, setIsAssignGuideOpen] = useState(false);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(null);
  const [availableGuides, setAvailableGuides] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get participant management capabilities
  const {
    localTourGroups,
    selectedParticipant,
    handleMoveParticipant,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    setSelectedParticipant,
    isMovePending,
    loadParticipants
  } = useGroupManagement(tour);
  
  // Manually load participants when component mounts
  useEffect(() => {
    if (tour.id) {
      console.log("Loading participants for tour:", tour.id);
      loadParticipants(tour.id);
    }
  }, [tour.id, loadParticipants]);
  
  // Use a stable reference for the groups to prevent reordering during renders
  const stableTourGroups = useMemo(() => {
    console.log("Creating stable tour groups from:", localTourGroups);
    
    if (!localTourGroups || localTourGroups.length === 0) {
      console.log("Using tour.tourGroups as fallback");
      if (!tour.tourGroups) return [];
      
      // Create a copy of the groups with their original indices preserved
      return tour.tourGroups.map((group, index) => ({
        ...group,
        originalIndex: index,
        displayName: group.name || `Group ${index + 1}`
      }));
    }
    
    // Create a copy of the groups with their original indices preserved
    return localTourGroups.map((group, index) => ({
      ...group,
      originalIndex: index,
      displayName: group.name || `Group ${index + 1}`
    }));
  }, [localTourGroups, tour.tourGroups]);
  
  console.log("Stable tour groups:", stableTourGroups);
  
  // Handle manual refresh of participant data
  const handleRefreshParticipants = async () => {
    if (!tour.id) return;
    
    setIsRefreshing(true);
    try {
      console.log("Manually refreshing participants for tour:", tour.id);
      await loadParticipants(tour.id);
      toast.success("Participant data refreshed");
    } catch (error) {
      console.error("Error refreshing participants:", error);
      toast.error("Failed to refresh participants");
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Process guides once when component loads or dependencies change
  useEffect(() => {
    // Get valid guides for guide selection - ONLY use guides from the database (with valid UUIDs)
    const validGuides = guides
      .filter(guide => guide.id && isValidUuid(guide.id) && guide.name)
      .map(guide => ({
        id: guide.id,
        name: guide.name,
        info: guide
      }));
    
    setAvailableGuides(validGuides);
  }, [guides]);
  
  const handleOpenAssignGuide = (groupIndex: number) => {
    setSelectedGroupIndex(groupIndex);
    setIsAssignGuideOpen(true);
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Group & Participant Management</CardTitle>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleRefreshParticipants}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Participants'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Display tour groups with their assigned guides and participants */}
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stableTourGroups.map((group) => {
                const index = group.originalIndex !== undefined ? group.originalIndex : 0;
                
                console.log(`Rendering group ${index}:`, group);
                console.log(`Group ${index} participants:`, group.participants);
                
                return (
                  <GroupCard
                    key={group.id || index}
                    group={group}
                    groupIndex={index}
                    tour={tour}
                    guide1Info={guide1Info}
                    guide2Info={guide2Info}
                    guide3Info={guide3Info}
                    onAssignGuide={handleOpenAssignGuide}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDragStart={handleDragStart}
                    onDragEnd={() => {}} // Empty function to satisfy prop
                    onMoveClick={setSelectedParticipant}
                    selectedParticipant={selectedParticipant}
                    handleMoveParticipant={handleMoveParticipant}
                    isMovePending={isMovePending}
                    onRefreshParticipants={handleRefreshParticipants}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>

      {selectedGroupIndex !== null && (
        <AssignGuideDialog
          isOpen={isAssignGuideOpen}
          onOpenChange={setIsAssignGuideOpen}
          tourId={tour.id}
          groupIndex={selectedGroupIndex}
          guides={availableGuides}
          currentGuideId={tour.tourGroups && tour.tourGroups[selectedGroupIndex]?.guideId}
        />
      )}

      {/* Move participant dialog */}
      {selectedParticipant && (
        <MoveParticipantSheet
          selectedParticipant={selectedParticipant}
          tourGroups={localTourGroups}
          onClose={() => setSelectedParticipant(null)}
          onMove={handleMoveParticipant}
          isMovePending={isMovePending}
        />
      )}
    </Card>
  );
};
