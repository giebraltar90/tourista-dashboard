
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { API_ANON_KEY } from "@/integrations/supabase/constants";

/**
 * Update a participant's group assignment with enhanced error handling
 */
export const updateParticipantGroup = async (participantId: string, newGroupId: string): Promise<boolean> => {
  try {
    logger.debug("🔄 [PARTICIPANT_MOVE] Attempting to update participant group", {
      participantId,
      newGroupId,
      timestamp: new Date().toISOString()
    });
    
    // Create update data with timestamp to ensure change is recognized
    const updateData = { 
      group_id: newGroupId,
      updated_at: new Date().toISOString() // Force timestamp update to avoid caching issues
    };
    
    // Log the detailed update being performed
    logger.debug("🔄 [PARTICIPANT_MOVE] Sending update to database", { 
      updateData, 
      url: `${supabase.supabaseUrl}/rest/v1/participants?id=eq.${participantId}` 
    });
    
    // CRITICAL FIX: Use a more reliable update with return values to confirm changes
    const { data: updatedParticipant, error: updateError } = await supabase
      .from('participants')
      .update(updateData)
      .eq('id', participantId)
      .select()
      .single();
      
    if (updateError) {
      logger.error("🔄 [PARTICIPANT_MOVE] Database error moving participant:", updateError);
      
      // Try a manual request as fallback with explicit headers
      logger.debug("🔄 [PARTICIPANT_MOVE] Attempting manual fallback request");
      
      try {
        const response = await fetch(`${supabase.supabaseUrl}/rest/v1/participants?id=eq.${participantId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': API_ANON_KEY,
            'Authorization': `Bearer ${API_ANON_KEY}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(updateData)
        });
        
        if (!response.ok) {
          const responseText = await response.text();
          logger.error("🔄 [PARTICIPANT_MOVE] Manual fallback request failed:", { 
            status: response.status, 
            statusText: response.statusText,
            response: responseText
          });
          return false;
        }
        
        logger.debug("🔄 [PARTICIPANT_MOVE] Manual fallback request succeeded");
        return true;
      } catch (fallbackError) {
        logger.error("🔄 [PARTICIPANT_MOVE] Manual fallback request exception:", fallbackError);
        return false;
      }
    }
    
    if (!updatedParticipant || updatedParticipant.group_id !== newGroupId) {
      logger.error("🔄 [PARTICIPANT_MOVE] Participant didn't update correctly:", {
        participant: updatedParticipant,
        expectedGroupId: newGroupId
      });
      
      // Attempt one more direct update as a fallback
      const { error: fallbackError } = await supabase
        .from('participants')
        .update({ 
          group_id: newGroupId,
          updated_at: new Date().toISOString()
        })
        .eq('id', participantId);
        
      if (fallbackError) {
        logger.error("🔄 [PARTICIPANT_MOVE] Fallback update failed:", fallbackError);
        return false;
      }
      
      logger.debug("🔄 [PARTICIPANT_MOVE] Fallback update attempted");
      return true;
    } else {
      logger.debug("🔄 [PARTICIPANT_MOVE] Successfully updated participant's group in database", {
        newGroupId: updatedParticipant.group_id,
        participantName: updatedParticipant.name
      });
      return true;
    }
  } catch (error) {
    logger.error("🔄 [PARTICIPANT_MOVE] Unexpected exception in updateParticipantGroup:", error);
    return false;
  }
};
