import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { AssignGuideForm } from "./guide-assignment";
import { useGuideData } from "@/hooks/useGuideData";

interface GuideAssignmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedGroupIndex: number | null;
  tourId: string;
  tourGroups: any[];
  validGuides: Array<{
    id: string;
    name: string;
    info: any;
  }>;
}

export const GuideAssignmentDialog = ({
  isOpen,
  onOpenChange,
  selectedGroupIndex,
  tourId,
  tourGroups,
  validGuides
}: GuideAssignmentDialogProps) => {
  // Load all guides from the database to supplement valid guides list
  const { guides: allDatabaseGuides } = useGuideData();
  
  // Combine validGuides with allDatabaseGuides, ensuring no duplicates
  const allAvailableGuides = [...validGuides];
  
  // Add database guides that aren't already in the validGuides list
  if (allDatabaseGuides && Array.isArray(allDatabaseGuides)) {
    allDatabaseGuides.forEach(dbGuide => {
      // Only add if not already in the list (check by ID and name)
      if (!allAvailableGuides.some(g => 
          g.id === dbGuide.id || 
          g.name === dbGuide.name)) {
        allAvailableGuides.push({
          id: dbGuide.id,
          name: dbGuide.name,
          info: dbGuide
        });
      }
    });
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Guide to Group</DialogTitle>
          <DialogDescription>
            Choose a guide to assign to this group
          </DialogDescription>
        </DialogHeader>
        {selectedGroupIndex !== null && tourGroups[selectedGroupIndex] && (
          <AssignGuideForm 
            tourId={tourId}
            groupIndex={selectedGroupIndex}
            guides={allAvailableGuides}
            currentGuideId={tourGroups[selectedGroupIndex].guideId}
            onSuccess={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
