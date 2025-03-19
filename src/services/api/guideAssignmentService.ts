
import { supabase } from "@/integrations/supabase/client";
import { isValidUuid, sanitizeGuideId } from "./utils/guidesUtils";

/**
 * Updates a guide's assignment to a group in Supabase directly
 * Implements multiple retries with exponential backoff to ensure the update goes through
 */
export const updateGuideInSupabase = async (
  tourId: string,
  groupId: string, 
  guideId: string | undefined | null, 
  newGroupName?: string
): Promise<boolean> => {
  if (!tourId || !groupId) {
    console.error("Missing required parameters for updateGuideInSupabase");
    return false;
  }

  try {
    // Sanitize guide ID for database storage
    // This converts special IDs like guide1 to null for database compatibility
    // while preserving them in the application state
    const safeGuideId = sanitizeGuideId(guideId);
    
    console.log(`Updating guide assignment in Supabase for group ${groupId}:`, {
      original_id: guideId,
      sanitized_id: safeGuideId,
      name: newGroupName
    });
    
    const updateData: any = {
      guide_id: safeGuideId // Use sanitized ID for database
    };
    
    // Only include name in update if it's provided
    if (newGroupName) {
      updateData.name = newGroupName;
    }
    
    // IMPROVED RETRY MECHANISM: Multiple attempts with exponential backoff
    const maxAttempts = 5;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const { error, data } = await supabase
          .from('tour_groups')
          .update(updateData)
          .eq('id', groupId)
          .eq('tour_id', tourId)
          .select();
          
        if (!error) {
          console.log(`Successfully updated guide assignment in Supabase on attempt ${attempt}`, data);
          // Force a delay to let the data settle in the database
          await new Promise(resolve => setTimeout(resolve, 500));
          return true;
        }
        
        console.error(`Guide assignment update error (attempt ${attempt}):`, error);
        
        if (attempt < maxAttempts) {
          const backoffTime = Math.min(500 * Math.pow(2, attempt), 5000); // Exponential backoff with max 5s
          console.warn(`Attempt ${attempt} failed, retrying in ${backoffTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
        } else {
          console.error("All attempts to update guide assignment failed");
        }
      } catch (attemptError) {
        console.error(`Error on attempt ${attempt}:`, attemptError);
        if (attempt === maxAttempts) {
          return false;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error("Error with direct Supabase update:", error);
    return false;
  }
};
