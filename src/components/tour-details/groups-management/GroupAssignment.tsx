
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
import { fetchParticipantsForTour } from "@/services/api/tourApi";

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

  // Get participant management capabilities
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
  
  // Manually load participants when component mounts
  useEffect(() => {
    if (tour.id) {
      console.log("Loading participants for tour:", tour.id);
      loadParticipants(tour.id);
      
      // As a fallback, directly fetch participants
      const fetchAndPopulate = async () => {
        try {
          console.log("Directly fetching participants for tour:", tour.id);
          const participants = await fetchParticipantsForTour(tour.id);
          console.log("Fetched participants:", participants);
          
          if (participants && participants.length > 0) {
            toast.success(`Found ${participants.length} participants`);
          }
        } catch (error) {
          console.error("Error fetching participants:", error);
        }
      };
      
      // Try this after a short delay
      setTimeout(fetchAndPopulate, 1000);
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
        <CardTitle>Group Assignment</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Display tour groups with their assigned guides and participants */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-medium">Current Group Assignments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stableTourGroups.map((group) => {
                const index = group.originalIndex !== undefined ? group.originalIndex : 0;
                
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
                    onDragStart={handleDragStart}
                    onMoveClick={setSelectedParticipant}
                    selectedParticipant={selectedParticipant}
                    handleMoveParticipant={handleMoveParticipant}
                    isMovePending={isMovePending}
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
