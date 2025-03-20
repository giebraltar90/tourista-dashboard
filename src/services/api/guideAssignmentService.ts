
import { supabase } from "@/integrations/supabase/client";
import { isValidUuid, isSpecialGuideId } from "./utils/guidesUtils";

/**
 * Updates a guide's assignment to a group in Supabase directly
 */
export const updateGuideInSupabase = async (
  tourId: string,
  groupId: string, 
  guideId: string | undefined | null,
  groupName?: string // Keep groupName optional
): Promise<boolean> => {
  if (!tourId || !groupId) {
    console.error("Missing required parameters for updateGuideInSupabase:", { tourId, groupId });
    return false;
  }

  try {
    console.log(`Updating guide assignment in Supabase for tour ${tourId}, group ${groupId}:`, {
      guideId,
      groupName
    });
    
    // Important: For null/"_none" we want to store null in the database
    // For special IDs (guide1, guide2, guide3), we'll just store the ID directly
    const dbGuideId = guideId && guideId !== "_none" ? guideId : null;
    
    // Log the guide ID details for debugging
    console.log("Guide ID details:", {
      value: guideId,
      dbValue: dbGuideId,
      type: typeof dbGuideId,
      isSpecial: guideId ? isSpecialGuideId(guideId) : false,
      isUuid: dbGuideId ? isValidUuid(dbGuideId) : false
    });
    
    // Build update object based on what data is provided
    const updateData: any = { guide_id: dbGuideId };
    
    // Only add name to update if it's provided
    if (groupName) {
      updateData.name = groupName;
    }

    // Log the actual data being sent to the database
    console.log("Sending to database:", updateData);

    // Update the guide assignment in the database
    const { error, data } = await supabase
      .from('tour_groups')
      .update(updateData)
      .eq('id', groupId)
      .eq('tour_id', tourId)
      .select();
      
    if (error) {
      console.error("Error updating guide assignment:", error);
      return false;
    }
    
    console.log("Successfully updated guide assignment in Supabase. Response:", data);
    // Add a small delay to let database update propagate
    await new Promise(resolve => setTimeout(resolve, 300));
    return true;
  } catch (error) {
    console.error("Error updating guide assignment:", error);
    return false;
  }
};
