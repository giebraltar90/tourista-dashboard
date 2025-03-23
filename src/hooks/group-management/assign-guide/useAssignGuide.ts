
import { useCallback } from "react";
import { useTourById } from "../../useTourData";
import { useModifications } from "../../useModifications";
import { toast } from "sonner";
import { resolveGroupId } from "./resolveGroupId";
import { processGuideId } from "./processGuideId";
import { prepareGroupName } from "./createGroupName";
import { updateDatabase } from "./updateDatabase";

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
        const groupId = resolveGroupId(tour, groupIndex);
        if (!groupId) {
          toast.error("Group not found");
          return false;
        }
        
        // Process guide ID (handle special cases like "guide1", "_none", etc.)
        const processedGuideId = await processGuideId(guideId || "_none");
        
        // Prepare the updated group name
        const updatedName = await prepareGroupName(groupId, processedGuideId);
        
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
        
        // Refetch tour data to update UI
        await refetch();
        
        return true;
      } catch (error) {
        console.error("Error assigning guide:", error);
        toast.error("An error occurred while assigning the guide");
        return false;
      }
    },
    [tour, refetch, addModification]
  );
  
  return { assignGuide };
};
