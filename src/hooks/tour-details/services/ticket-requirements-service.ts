
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Service to manage ticket requirements storage and retrieval
 */
export interface TicketRequirements {
  totalTicketsRequired: number;
  guideChildTickets: number;
  guideAdultTickets: number;
  participantChildTickets: number;
  participantAdultTickets: number;
  tourId: string;
}

/**
 * Save ticket requirements to the database
 */
export const saveTicketRequirements = async (requirements: TicketRequirements): Promise<boolean> => {
  try {
    logger.debug("Saving ticket requirements:", requirements);
    
    const { error } = await supabase
      .from('ticket_requirements')
      .upsert({
        tour_id: requirements.tourId,
        total_tickets_required: requirements.totalTicketsRequired,
        guide_child_tickets: requirements.guideChildTickets,
        guide_adult_tickets: requirements.guideAdultTickets,
        participant_child_tickets: requirements.participantChildTickets,
        participant_adult_tickets: requirements.participantAdultTickets,
        timestamp: new Date().toISOString()
      }, { onConflict: 'tour_id' });
      
    if (error) {
      logger.error("Error saving ticket requirements:", error);
      return false;
    }
    
    logger.debug("Successfully saved ticket requirements");
    return true;
  } catch (err) {
    logger.error("Exception in saveTicketRequirements:", err);
    return false;
  }
};

/**
 * Get ticket requirements from the database
 */
export const getTicketRequirements = async (tourId: string): Promise<TicketRequirements | null> => {
  try {
    logger.debug("Getting ticket requirements for tour:", tourId);
    
    const { data, error } = await supabase
      .from('ticket_requirements')
      .select('*')
      .eq('tour_id', tourId)
      .single();
      
    if (error) {
      logger.error("Error getting ticket requirements:", error);
      return null;
    }
    
    if (!data) {
      logger.debug("No ticket requirements found for tour:", tourId);
      return null;
    }
    
    return {
      tourId: data.tour_id,
      totalTicketsRequired: data.total_tickets_required,
      guideChildTickets: data.guide_child_tickets,
      guideAdultTickets: data.guide_adult_tickets,
      participantChildTickets: data.participant_child_tickets,
      participantAdultTickets: data.participant_adult_tickets
    };
  } catch (err) {
    logger.error("Exception in getTicketRequirements:", err);
    return null;
  }
};

/**
 * Calculate and save ticket requirements
 */
export const calculateAndSaveTicketRequirements = async (
  tourId: string,
  participantAdultCount: number,
  participantChildCount: number,
  guideAdultTickets: number,
  guideChildTickets: number
): Promise<TicketRequirements | null> => {
  try {
    const totalTicketsRequired = 
      participantAdultCount + 
      participantChildCount + 
      guideAdultTickets + 
      guideChildTickets;
      
    const requirements: TicketRequirements = {
      tourId,
      totalTicketsRequired,
      guideChildTickets,
      guideAdultTickets,
      participantChildTickets: participantChildCount,
      participantAdultTickets: participantAdultCount
    };
    
    const success = await saveTicketRequirements(requirements);
    
    if (!success) {
      logger.error("Failed to save ticket requirements");
      return null;
    }
    
    return requirements;
  } catch (err) {
    logger.error("Exception in calculateAndSaveTicketRequirements:", err);
    return null;
  }
};
