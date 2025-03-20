
import { supabase } from "@/integrations/supabase/client";

/**
 * Updates a guide's assignment to a group in Supabase directly
 */
export const updateGuideInSupabase = async (
  tourId: string,
  groupId: string, 
  guideId: string | undefined | null,
  groupName?: string // Make groupName optional
): Promise<boolean> => {
  if (!tourId || !groupId) {
    console.error("Missing required parameters for updateGuideInSupabase");
    return false;
  }

  try {
    console.log(`Updating guide assignment in Supabase for tour ${tourId}, group ${groupId}:`, {
      guideId,
      groupName
    });
    
    // Multiple attempts with exponential backoff
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Build update object based on what data is provided
        const updateData: any = { guide_id: guideId };
        
        // Only add name to update if it's provided
        if (groupName) {
          updateData.name = groupName;
        }

        const { error } = await supabase
          .from('tour_groups')
          .update(updateData)
          .eq('id', groupId)
          .eq('tour_id', tourId);
          
        if (!error) {
          console.log(`Successfully updated guide assignment in Supabase on attempt ${attempt}`);
          // Wait a moment to let the database update
          await new Promise(resolve => setTimeout(resolve, 300));
          return true;
        }
        
        console.error(`Guide assignment update error (attempt ${attempt}):`, error);
        
        if (attempt < maxAttempts) {
          const backoffTime = 500 * Math.pow(2, attempt); 
          await new Promise(resolve => setTimeout(resolve, backoffTime));
        }
      } catch (attemptError) {
        console.error(`Error on attempt ${attempt}:`, attemptError);
      }
    }
    
    return false;
  } catch (error) {
    console.error("Error updating guide assignment:", error);
    return false;
  }
};
