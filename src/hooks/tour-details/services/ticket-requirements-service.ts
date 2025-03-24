
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Calculate and save ticket requirements to the database
 */
export const calculateAndSaveTicketRequirements = async (
  tourId: string,
  participantAdultTickets: number,
  participantChildTickets: number,
  guideAdultTickets: number,
  guideChildTickets: number
): Promise<boolean> => {
  try {
    const totalTicketsRequired = 
      participantAdultTickets + 
      participantChildTickets + 
      guideAdultTickets + 
      guideChildTickets;
      
    logger.debug("🎟️ [SAVE_REQUIREMENTS] Saving ticket requirements:", {
      tourId,
      participantAdultTickets,
      participantChildTickets,
      guideAdultTickets,
      guideChildTickets,
      totalTicketsRequired
    });
    
    // Check if we already have a record for this tour
    const { data: existingData, error: checkError } = await supabase
      .from('ticket_requirements')
      .select('id')
      .eq('tour_id', tourId)
      .maybeSingle();
      
    if (checkError) {
      logger.error("🎟️ [SAVE_REQUIREMENTS] Error checking for existing record:", checkError);
      return false;
    }
    
    if (existingData?.id) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('ticket_requirements')
        .update({
          participant_adult_tickets: participantAdultTickets,
          participant_child_tickets: participantChildTickets,
          guide_adult_tickets: guideAdultTickets,
          guide_child_tickets: guideChildTickets,
          total_tickets_required: totalTicketsRequired,
          timestamp: new Date().toISOString()
        })
        .eq('id', existingData.id);
        
      if (updateError) {
        logger.error("🎟️ [SAVE_REQUIREMENTS] Error updating requirements:", updateError);
        return false;
      }
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('ticket_requirements')
        .insert({
          tour_id: tourId,
          participant_adult_tickets: participantAdultTickets,
          participant_child_tickets: participantChildTickets,
          guide_adult_tickets: guideAdultTickets,
          guide_child_tickets: guideChildTickets,
          total_tickets_required: totalTicketsRequired
        });
        
      if (insertError) {
        logger.error("🎟️ [SAVE_REQUIREMENTS] Error inserting requirements:", insertError);
        return false;
      }
    }
    
    logger.debug("🎟️ [SAVE_REQUIREMENTS] Successfully saved ticket requirements");
    return true;
  } catch (error) {
    logger.error("🎟️ [SAVE_REQUIREMENTS] Unexpected error:", error);
    return false;
  }
};

/**
 * Get ticket requirements for a specific tour
 */
export const getTicketRequirements = async (tourId: string) => {
  try {
    logger.debug("🎟️ [GET_REQUIREMENTS] Fetching ticket requirements for tour:", tourId);
    
    const { data, error } = await supabase
      .from('ticket_requirements')
      .select('*')
      .eq('tour_id', tourId)
      .maybeSingle();
      
    if (error) {
      logger.error("🎟️ [GET_REQUIREMENTS] Error fetching requirements:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    logger.error("🎟️ [GET_REQUIREMENTS] Unexpected error:", error);
    return null;
  }
};
