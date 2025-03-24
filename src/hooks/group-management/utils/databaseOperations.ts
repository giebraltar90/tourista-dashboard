
import { supabase } from "@/integrations/supabase/client";
import { updateGuideInSupabase } from "@/services/api/guideAssignmentService";

/**
 * Persists guide assignment changes to the database with retry mechanism
 */
export const persistGuideAssignmentChanges = async (
  tourId: string,
  groupId: string,
  guideId: string | null,
  groupName: string,
  updatedGroups: any[]
): Promise<boolean> => {
  if (!tourId || !groupId) {
    console.error("Cannot persist guide assignment: Invalid tour or group ID");
    return false;
  }

  // Maximum number of retry attempts
  const MAX_RETRIES = 3;
  let attempt = 0;
  let success = false;

  while (attempt < MAX_RETRIES && !success) {
    try {
      console.log(`Persisting guide assignment (attempt ${attempt + 1}/${MAX_RETRIES}):`, {
        tourId,
        groupId,
        guideId,
        groupName
      });

      // First try the direct updateGuideInSupabase function
      success = await updateGuideInSupabase(tourId, groupId, guideId, groupName);
      
      if (success) {
        console.log("Successfully persisted guide assignment using updateGuideInSupabase");
        break;
      }
      
      // If that fails, try a direct Supabase call
      const { error } = await supabase
        .from('tour_groups')
        .update({
          guide_id: guideId,
          name: groupName
        })
        .eq('id', groupId)
        .eq('tour_id', tourId);
        
      if (!error) {
        console.log("Successfully persisted guide assignment with direct Supabase call");
        success = true;
        break;
      } else {
        console.error(`Failed to persist guide assignment (attempt ${attempt + 1}/${MAX_RETRIES}):`, error);
      }
    } catch (error) {
      console.error(`Error persisting guide assignment (attempt ${attempt + 1}/${MAX_RETRIES}):`, error);
    }
    
    // Increase retry attempt
    attempt++;
    
    // Wait before retrying
    if (attempt < MAX_RETRIES) {
      const delay = Math.min(500 * Math.pow(2, attempt), 3000); // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return success;
};
