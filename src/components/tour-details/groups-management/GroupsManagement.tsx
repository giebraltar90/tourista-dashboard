
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GroupsGrid } from "./GroupsGrid";
import { useGroupManagement } from "@/hooks/group-management";
import { useGuideInfo } from "@/hooks/guides";
import { VentrataTourGroup } from "@/types/ventrata";
import { calculateTotalParticipants } from "@/hooks/group-management/services/participantService";
import { GroupDialogsContainer } from "./components/GroupDialogsContainer";

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
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
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

  // Add CSS for drag and drop styling
  useEffect(() => {
    // Add global styles for drag and drop operations
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .drag-over {
        background-color: rgba(var(--primary-rgb), 0.1);
        border: 2px dashed hsl(var(--primary));
        border-radius: 0.5rem;
      }
      
      [data-drop-target="true"] {
        min-height: 100px;
      }
      
      [data-drop-target="true"]:empty:not(.drag-over) {
        border: 1px dashed rgba(0, 0, 0, 0.1);
      }
    `;
    document.head.appendChild(styleElement);
    
    // Clean up the style element on unmount
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Participant Management</CardTitle>
        <CardDescription>Drag and drop participants between groups</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
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
          />
        </div>
      </CardContent>

      {/* Render all dialogs */}
      {dialogsComponent}
    </Card>
  );
};
