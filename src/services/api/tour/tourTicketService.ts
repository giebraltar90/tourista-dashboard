
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { EventEmitter } from "@/utils/eventEmitter";

/**
 * Interface for ticket requirements
 */
export interface TourTicketRequirements {
  tourId: string;
  participantAdultTickets: number;
  participantChildTickets: number;
  guideAdultTickets: number;
  guideChildTickets: number;
  totalTicketsRequired: number;
  timestamp: string;
}

/**
 * Store ticket requirements in the database
 */
export const storeTicketRequirements = async (
  tourId: string,
  participantAdultTickets: number,
  participantChildTickets: number,
  guideAdultTickets: number,
  guideChildTickets: number
): Promise<boolean> => {
  try {
    if (!tourId) {
      logger.error("Cannot store ticket requirements without a tour ID");
      return false;
    }
    
    // Calculate total tickets
    const totalTicketsRequired = 
      participantAdultTickets + 
      participantChildTickets + 
      guideAdultTickets + 
      guideChildTickets;
    
    // Update the tour with the calculated ticket requirements
    const { error } = await supabase
      .from('tours')
      .update({
        num_tickets: totalTicketsRequired,
        updated_at: new Date().toISOString()
      })
      .eq('id', tourId);
    
    if (error) {
      logger.error(`Error storing ticket requirements for tour ${tourId}:`, error);
      return false;
    }
    
    logger.debug(`Successfully stored ticket requirements for tour ${tourId}:`, {
      participantAdultTickets,
      participantChildTickets,
      guideAdultTickets,
      guideChildTickets,
      totalTicketsRequired
    });
    
    // Trigger event to notify other components of the update
    EventEmitter.emit(`ticket-requirements-updated:${tourId}`, {
      tourId,
      participantAdultTickets,
      participantChildTickets,
      guideAdultTickets,
      guideChildTickets,
      totalTicketsRequired
    });
    
    return true;
  } catch (error) {
    logger.error(`Error in storeTicketRequirements for tour ${tourId}:`, error);
    return false;
  }
};

/**
 * Get ticket requirements from the database
 */
export const getTicketRequirements = async (
  tourId: string
): Promise<TourTicketRequirements | null> => {
  try {
    if (!tourId) {
      logger.error("Cannot get ticket requirements without a tour ID");
      return null;
    }
    
    // Get tour data with ticket requirements
    const { data, error } = await supabase
      .from('tours')
      .select('id, num_tickets, updated_at')
      .eq('id', tourId)
      .single();
    
    if (error || !data) {
      logger.error(`Error getting ticket requirements for tour ${tourId}:`, error);
      return null;
    }
    
    // We only store total tickets in the database currently,
    // so we can't break it down into detailed categories
    return {
      tourId: data.id,
      participantAdultTickets: 0, // We don't have this breakdown stored yet
      participantChildTickets: 0, // We don't have this breakdown stored yet
      guideAdultTickets: 0, // We don't have this breakdown stored yet
      guideChildTickets: 0, // We don't have this breakdown stored yet
      totalTicketsRequired: data.num_tickets || 0,
      timestamp: data.updated_at
    };
  } catch (error) {
    logger.error(`Error in getTicketRequirements for tour ${tourId}:`, error);
    return null;
  }
};

/**
 * Update ticket count when participant counts change
 */
export const updateTicketCountsFromParticipants = async (
  tourId: string,
  adultCount: number,
  childCount: number
): Promise<boolean> => {
  try {
    // Get current guide ticket requirements first
    const { data: tourData, error: tourError } = await supabase
      .from('tours')
      .select('id, num_tickets')
      .eq('id', tourId)
      .single();
      
    if (tourError) {
      logger.error(`Error fetching tour data for ticket update:`, tourError);
      return false;
    }
    
    // Calculate the total tickets needed
    const totalTickets = adultCount + childCount + (tourData?.num_tickets || 0);
    
    // Update the tour with the new total
    const { error } = await supabase
      .from('tours')
      .update({
        num_tickets: totalTickets,
        updated_at: new Date().toISOString()
      })
      .eq('id', tourId);
      
    if (error) {
      logger.error(`Error updating ticket count:`, error);
      return false;
    }
    
    // Trigger event to notify other components
    EventEmitter.emit(`ticket-requirements-updated:${tourId}`, {
      tourId,
      totalTicketsRequired: totalTickets
    });
    
    return true;
  } catch (error) {
    logger.error(`Error in updateTicketCountsFromParticipants:`, error);
    return false;
  }
};
