
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/utils/logger";
import { EventEmitter } from "@/utils/eventEmitter";

export interface TourTicketRequirements {
  id?: string;
  tourId: string;
  participantAdultTickets: number;
  participantChildTickets: number;
  guideAdultTickets: number;
  guideChildTickets: number;
  totalTicketsRequired: number;
  timestamp: string;
}

/**
 * Store ticket requirements for a tour in the database
 */
export const storeTicketRequirements = async (
  tourId: string,
  participantAdultTickets: number,
  participantChildTickets: number,
  guideAdultTickets: number,
  guideChildTickets: number
): Promise<boolean> => {
  try {
    const timestamp = new Date().toISOString();
    const totalTicketsRequired = 
      participantAdultTickets + 
      participantChildTickets + 
      guideAdultTickets + 
      guideChildTickets;
    
    logger.debug(`Storing ticket requirements for tour ${tourId}:`, {
      participantAdultTickets,
      participantChildTickets,
      guideAdultTickets,
      guideChildTickets,
      totalTicketsRequired
    });
    
    // First, check if requirements already exist for this tour
    const { data: existingRequirements, error: checkError } = await supabase
      .from('ticket_requirements')
      .select('id')
      .eq('tour_id', tourId)
      .maybeSingle();
    
    if (checkError) {
      logger.error(`Error checking existing ticket requirements for tour ${tourId}:`, checkError);
      return false;
    }
    
    // Prepare data to store
    const requirementsData: Omit<TourTicketRequirements, 'id'> = {
      tourId,
      participantAdultTickets,
      participantChildTickets,
      guideAdultTickets,
      guideChildTickets,
      totalTicketsRequired,
      timestamp
    };
    
    let result;
    
    // Update or insert depending on whether requirements already exist
    if (existingRequirements?.id) {
      // Update existing requirements
      const { error: updateError } = await supabase
        .from('ticket_requirements')
        .update(requirementsData)
        .eq('id', existingRequirements.id);
      
      if (updateError) {
        logger.error(`Error updating ticket requirements for tour ${tourId}:`, updateError);
        return false;
      }
      
      result = { ...requirementsData, id: existingRequirements.id };
    } else {
      // Insert new requirements
      const { data: insertedData, error: insertError } = await supabase
        .from('ticket_requirements')
        .insert(requirementsData)
        .select('id')
        .single();
      
      if (insertError) {
        logger.error(`Error inserting ticket requirements for tour ${tourId}:`, insertError);
        return false;
      }
      
      result = { ...requirementsData, id: insertedData?.id };
    }
    
    // Emit an event to notify that ticket requirements have been updated
    if (result) {
      EventEmitter.emit(`ticket-requirements-updated:${tourId}`, result);
    }
    
    return true;
  } catch (error) {
    logger.error(`Error storing ticket requirements for tour ${tourId}:`, error);
    return false;
  }
};

/**
 * Get stored ticket requirements for a tour
 */
export const getTicketRequirements = async (tourId: string): Promise<TourTicketRequirements | null> => {
  try {
    const { data, error } = await supabase
      .from('ticket_requirements')
      .select('*')
      .eq('tour_id', tourId)
      .maybeSingle();
    
    if (error) {
      logger.error(`Error getting ticket requirements for tour ${tourId}:`, error);
      return null;
    }
    
    if (!data) {
      logger.debug(`No ticket requirements found for tour ${tourId}`);
      return null;
    }
    
    // Transform to camelCase properties
    return {
      id: data.id,
      tourId: data.tour_id,
      participantAdultTickets: data.participant_adult_tickets,
      participantChildTickets: data.participant_child_tickets,
      guideAdultTickets: data.guide_adult_tickets,
      guideChildTickets: data.guide_child_tickets,
      totalTicketsRequired: data.total_tickets_required,
      timestamp: data.timestamp
    };
  } catch (error) {
    logger.error(`Error getting ticket requirements for tour ${tourId}:`, error);
    return null;
  }
};

/**
 * Delete ticket requirements for a tour
 */
export const deleteTicketRequirements = async (tourId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('ticket_requirements')
      .delete()
      .eq('tour_id', tourId);
    
    if (error) {
      logger.error(`Error deleting ticket requirements for tour ${tourId}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    logger.error(`Error deleting ticket requirements for tour ${tourId}:`, error);
    return false;
  }
};
