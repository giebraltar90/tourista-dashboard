
import { useCallback } from "react";
import { useTourById } from "../../useTourData";
import { useModifications } from "../../useModifications";
import { toast } from "sonner";
import { resolveGroupId } from "./resolveGroupId";
import { processGuideId } from "./processGuideId";
import { prepareGroupName } from "./createGroupName";
import { updateDatabase } from "./updateDatabase";
import { EventEmitter } from "@/utils/eventEmitter";
import { logger } from "@/utils/logger";
import { syncTourGuideAssignments } from "@/services/api/guideAssignmentService";

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
        
        logger.debug("🔄 [ASSIGN_GUIDE] Starting guide assignment", {
          tourId,
          groupIndex,
          guideId: guideId || "_none"
        });
        
        // Resolve group ID from index
        const result = await resolveGroupId(tourId, groupIndex);
        if (!result || !result.groupId) {
          toast.error("Group not found");
          return false;
        }
        
        const groupId = result.groupId;
        
        // Process guide ID (handle special cases like "guide1", "_none", etc.)
        const processedGuideId = await processGuideId(guideId || "_none");
        
        logger.debug("🔄 [ASSIGN_GUIDE] Processed guide ID:", {
          original: guideId,
          processed: processedGuideId
        });
        
        // Prepare the updated group name
        const updatedName = await prepareGroupName(groupId, processedGuideId);
        
        // Update the database
        const success = await updateDatabase(groupId, processedGuideId, updatedName);
        
        if (!success) {
          toast.error("Failed to assign guide");
          return false;
        }
        
        // Sync guide assignments to ensure consistency
        await syncTourGuideAssignments(tourId);
        
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
        
        // Notify of guide change to trigger ticket recalculation
        EventEmitter.emit(`guide-change:${tourId}`);
        
        logger.debug("🔄 [ASSIGN_GUIDE] Guide assignment completed successfully", {
          groupId,
          guideId: processedGuideId
        });
        
        // Refetch tour data to update UI
        await refetch();
        
        return true;
      } catch (error) {
        logger.error("🔄 [ASSIGN_GUIDE] Error assigning guide:", error);
        toast.error("An error occurred while assigning the guide");
        return false;
      }
    },
    [tour, refetch, addModification, tourId]
  );
  
  return { assignGuide };
};
