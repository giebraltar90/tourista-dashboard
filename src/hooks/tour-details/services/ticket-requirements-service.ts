
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

// Define the ticket requirements interface
export interface TicketRequirements {
  tourId: string;
  participantAdultCount: number;
  participantChildCount: number;
  guideAdultTickets: number;
  guideChildTickets: number;
  totalTicketsRequired: number;
  updatedAt?: string;
}

/**
 * Fetch ticket requirements for a tour
 */
export const getTicketRequirements = async (tourId: string): Promise<TicketRequirements> => {
  try {
    // Try to get requirements from database first
    const { data, error } = await supabase
      .from('ticket_requirements')
      .select('*')
      .eq('tour_id', tourId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error) {
      logger.debug("No ticket requirements found in database:", error);
      // Return default values if not found
      return {
        tourId,
        participantAdultCount: 0,
        participantChildCount: 0,
        guideAdultTickets: 0,
        guideChildTickets: 0,
        totalTicketsRequired: 0
      };
    }
    
    return {
      tourId: data.tour_id,
      participantAdultCount: data.participant_adult_tickets || 0,
      participantChildCount: data.participant_child_tickets || 0,
      guideAdultTickets: data.guide_adult_tickets || 0,
      guideChildTickets: data.guide_child_tickets || 0,
      totalTicketsRequired: data.total_tickets_required || 0,
      updatedAt: data.updated_at
    };
  } catch (error) {
    logger.error("Error fetching ticket requirements:", error);
    // Return default values in case of error
    return {
      tourId,
      participantAdultCount: 0,
      participantChildCount: 0,
      guideAdultTickets: 0,
      guideChildTickets: 0,
      totalTicketsRequired: 0
    };
  }
};

/**
 * Calculate and save ticket requirements for a tour
 */
export const calculateAndSaveTicketRequirements = async (
  tourId: string,
  adultCount: number,
  childCount: number,
  guideAdultTickets: number,
  guideChildTickets: number
): Promise<boolean> => {
  try {
    const totalTicketsRequired = adultCount + childCount + guideAdultTickets + guideChildTickets;
    
    const { error } = await supabase
      .from('ticket_requirements')
      .upsert({
        tour_id: tourId,
        participant_adult_tickets: adultCount,
        participant_child_tickets: childCount,
        guide_adult_tickets: guideAdultTickets,
        guide_child_tickets: guideChildTickets,
        total_tickets_required: totalTicketsRequired,
        timestamp: new Date().toISOString()
      });
      
    if (error) {
      logger.error("Error saving ticket requirements:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    logger.error("Exception saving ticket requirements:", error);
    return false;
  }
};
