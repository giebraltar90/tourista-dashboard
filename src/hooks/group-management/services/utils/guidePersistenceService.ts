
import { supabase } from "@/integrations/supabase/client";
import { API_ANON_KEY } from "@/integrations/supabase/constants";
import { updateGuideInSupabase } from "@/services/api/guideAssignmentService";
import { logger } from "@/utils/logger";

/**
 * Persists guide assignment changes to the database with enhanced authentication
 */
export const persistGuideAssignmentChanges = async (
  tourId: string,
  groupId: string,
  guideId: string | null,
  groupName: string,
  updatedGroups: any[]
): Promise<boolean> => {
  if (!tourId || !groupId) {
    logger.error("Cannot persist guide assignment: Invalid tour or group ID");
    return false;
  }

  // Maximum number of retry attempts
  const MAX_RETRIES = 5;
  let attempt = 0;
  let success = false;

  logger.debug(`Starting guide assignment persistence for group ${groupId} in tour ${tourId}`, {
    guideId,
    groupName,
    timestamp: new Date().toISOString()
  });

  while (attempt < MAX_RETRIES && !success) {
    try {
      logger.debug(`Persisting guide assignment (attempt ${attempt + 1}/${MAX_RETRIES}):`, {
        tourId,
        groupId,
        guideId,
        groupName
      });

      // First try the direct updateGuideInSupabase function
      success = await updateGuideInSupabase(tourId, groupId, guideId, groupName);
      
      if (success) {
        logger.debug("Successfully persisted guide assignment using updateGuideInSupabase");
        break;
      }
      
      // If that fails, try a direct Supabase call with explicit authentication
      const updateData = {
        guide_id: guideId,
        name: groupName,
        updated_at: new Date().toISOString()
      };
      
      logger.debug("Attempting direct Supabase update", {
        updateData,
        url: `${supabase.supabaseUrl}/rest/v1/tour_groups?id=eq.${groupId}&tour_id=eq.${tourId}`
      });
      
      const { error } = await supabase
        .from('tour_groups')
        .update(updateData)
        .eq('id', groupId)
        .eq('tour_id', tourId);
        
      if (!error) {
        logger.debug("Successfully persisted guide assignment with direct Supabase call");
        success = true;
        break;
      } else {
        logger.error(`Failed to persist guide assignment (attempt ${attempt + 1}/${MAX_RETRIES}):`, error);
        
        // Try a completely manual fetch request as a last resort
        if (attempt === MAX_RETRIES - 1) {
          try {
            logger.debug("Attempting manual fetch request as last resort");
            
            const response = await fetch(`${supabase.supabaseUrl}/rest/v1/tour_groups?id=eq.${groupId}&tour_id=eq.${tourId}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'apikey': API_ANON_KEY,
                'Authorization': `Bearer ${API_ANON_KEY}`,
                'Prefer': 'return=representation'
              },
              body: JSON.stringify(updateData)
            });
            
            if (response.ok) {
              logger.debug("Manual fetch request succeeded");
              success = true;
              break;
            } else {
              const responseText = await response.text();
              logger.error("Manual fetch request failed:", { 
                status: response.status, 
                statusText: response.statusText,
                response: responseText
              });
            }
          } catch (manualError) {
            logger.error("Error in manual fetch request:", manualError);
          }
        }
      }
    } catch (error) {
      logger.error(`Error persisting guide assignment (attempt ${attempt + 1}/${MAX_RETRIES}):`, error);
    }
    
    // Increase retry attempt
    attempt++;
    
    // Wait before retrying with exponential backoff
    if (attempt < MAX_RETRIES) {
      const delay = Math.min(500 * Math.pow(2, attempt), 10000); // Exponential backoff up to 10 seconds
      logger.debug(`Waiting ${delay}ms before retry ${attempt + 1}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // Log final result
  if (success) {
    logger.debug(`Successfully persisted guide assignment for group ${groupId} after ${attempt + 1} attempts`);
  } else {
    logger.error(`Failed to persist guide assignment for group ${groupId} after ${MAX_RETRIES} attempts`);
  }

  return success;
};
