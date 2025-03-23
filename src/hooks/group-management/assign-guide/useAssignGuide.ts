
import { useCallback } from "react";
import { useTourById } from "../../tourData/useTourById";
import { useModifications } from "../../useModifications";
import { toast } from "sonner";
import { resolveGroupId } from "./resolveGroupId";
import { processGuideId } from "./processGuideId";
import { prepareGroupName } from "./createGroupName";
import { updateDatabase } from "./updateDatabase";
import { EventEmitter, EVENTS } from "@/utils/eventEmitter";
import { logger } from "@/utils/logger";

export const useAssignGuide = (tourId: string) => {
  const { data: tour, refetch } = useTourById(tourId);
  const { addModification } = useModifications(tourId);
  
  const assignGuide = useCallback(
    async (groupIndex: number, guideId: string | null) => {
      try {
        if (!tour) {
          toast.error("Tour not found");
          return false;
        }
        
        // Resolve group ID from index
        const result = await resolveGroupId(tourId, groupIndex);
        if (!result || !result.groupId) {
          toast.error("Group not found");
          return false;
        }
        
        const groupId = result.groupId;
        
        // Process guide ID (handle special cases like "guide1", "_none", etc.)
        const processedGuideId = await processGuideId(guideId || "_none");
        
        // Prepare the updated group name
        const updatedName = await prepareGroupName(groupId, processedGuideId);
        
        logger.debug(`🔧 [useAssignGuide] Assigning guide for tour ${tourId}, group ${groupIndex}:`, {
          groupId,
          originalGuideId: guideId,
          processedGuideId,
          updatedName
        });
        
        // Update the database
        const success = await updateDatabase(groupId, processedGuideId, updatedName);
        
        if (!success) {
          toast.error("Failed to assign guide");
          return false;
        }
        
        // Record the modification
        const guideName = processedGuideId ? "new guide" : "removed guide";
        await addModification({
          description: `Group ${groupIndex + 1}: ${processedGuideId ? "Assigned" : "Removed"} guide`,
          details: {
            type: "guide_assignment",
            groupId,
            guideId: processedGuideId,
            timestamp: new Date().toISOString()
          }
        });
        
        // Emit multiple events to ensure all components update
        // This is critical for ensuring the UI stays in sync with the database
        
        // 1. Notify of guide change to trigger ticket recalculation
        EventEmitter.emit(EVENTS.GUIDE_CHANGED(tourId));
        logger.debug(`🔧 [useAssignGuide] Emitted ${EVENTS.GUIDE_CHANGED(tourId)} event`);
        
        // 2. Explicitly trigger ticket recalculation
        EventEmitter.emit(EVENTS.RECALCULATE_TICKETS(tourId), {
          source: 'guide_assignment',
          tourId,
          groupId,
          guideId: processedGuideId
        });
        
        // 3. Emit guide assignment updated event with detailed data
        EventEmitter.emit(EVENTS.GUIDE_ASSIGNMENT_UPDATED(tourId), {
          tourId,
          groupId,
          groupIndex,
          guideId: processedGuideId
        });
        
        // Refetch tour data to update UI after a small delay
        // This ensures the database has time to process the update
        setTimeout(async () => {
          await refetch();
        }, 500);
        
        return true;
      } catch (error) {
        console.error("Error assigning guide:", error);
        toast.error("An error occurred while assigning the guide");
        return false;
      }
    },
    [tour, refetch, addModification, tourId]
  );
  
  return { assignGuide };
};
