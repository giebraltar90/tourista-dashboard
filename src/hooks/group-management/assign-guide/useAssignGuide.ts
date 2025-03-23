
import { useCallback } from "react";
import { useTourById } from "../../tourData/useTourById";
import { useModifications } from "../../useModifications";
import { toast } from "sonner";
import { resolveGroupId } from "./resolveGroupId";
import { processGuideId } from "./processGuideId";
import { prepareGroupName } from "./createGroupName";
import { updateDatabase } from "./updateDatabase";
import { EventEmitter } from "@/utils/eventEmitter";
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
        
        // Notify of guide change to trigger ticket recalculation - important!
        EventEmitter.emit(`guide-change:${tourId}`);
        logger.debug(`🔧 [useAssignGuide] Emitted guide-change:${tourId} event`);
        
        // Refetch tour data to update UI
        await refetch();
        
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
