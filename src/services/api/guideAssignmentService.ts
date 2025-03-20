
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
    
    // Important: Always store the guide ID directly as provided by the assignment function
    // The mapping to UUID should have happened before this function was called
    const dbGuideId = guideId && guideId !== "_none" ? guideId : null;
    
    // Log the guide ID details for debugging
    console.log("Guide ID details:", {
      value: guideId,
      dbValue: dbGuideId,
      type: typeof dbGuideId,
      isSpecial: guideId ? isSpecialGuideId(guideId) : false,
      isUuid: dbGuideId ? isValidUuid(dbGuideId) : false
    });
    
    // Validate that we're storing a UUID or null
    if (dbGuideId !== null && !isValidUuid(dbGuideId)) {
      console.error(`Invalid guide ID format for database: ${dbGuideId}. Database expects UUID values.`);
      
      // Try to determine the issue in more detail
      if (isSpecialGuideId(dbGuideId)) {
        console.error(`Guide ID is a special ID (${dbGuideId}) but should have been mapped to a UUID before calling updateGuideInSupabase`);
      } else {
        console.error(`Guide ID ${dbGuideId} is not a valid UUID and not a special ID. Check the mapping logic.`);
      }
      
      return false;
    }
    
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
