
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { GuideInfo } from "@/types/ventrata";

export interface UnifiedTicketResult {
  participantAdultCount: number;
  participantChildCount: number;
  guideAdultTickets: number;
  guideChildTickets: number;
  totalTicketsRequired: number;
  guidesWithTickets: Array<{
    guideName: string;
    guideType: string;
    ticketType: 'adult' | 'child' | 'none' | null;
  }>;
}

/**
 * Centralized service for all ticket calculations - designed to be reused
 * across the application and reduce duplicate code
 */
export const centralTicketService = {
  /**
   * Determines if a location requires guide tickets
   */
  locationRequiresTickets(location: string): boolean {
    const ticketLocations = ["Versailles", "Louvre", "Disneyland", "Eiffel Tower"];
    return ticketLocations.includes(location);
  },
  
  /**
   * Checks if a guide requires a ticket based on guide type
   */
  guideNeedsTicket(guideType: string): boolean {
    const typesRequiringTickets = ['staff', 'contractor', 'guide'];
    return typesRequiringTickets.some(type => 
      guideType.toLowerCase().includes(type)
    );
  },
  
  /**
   * Calculates tickets for guides and participants
   */
  calculateTickets(
    location: string,
    guides: (GuideInfo | null | undefined)[],
    adultParticipants: number,
    childParticipants: number
  ): UnifiedTicketResult {
    // Skip calculation if location doesn't require tickets
    if (!this.locationRequiresTickets(location)) {
      return {
        participantAdultCount: adultParticipants,
        participantChildCount: childParticipants,
        guideAdultTickets: 0,
        guideChildTickets: 0,
        totalTicketsRequired: adultParticipants + childParticipants,
        guidesWithTickets: []
      };
    }
    
    // Process guides and determine ticket requirements
    let guideAdultTickets = 0;
    let guideChildTickets = 0;
    const guidesWithTickets = [];
    
    for (const guide of guides) {
      if (!guide) continue;
      
      if (this.guideNeedsTicket(guide.guideType)) {
        // For now, all guides requiring tickets use adult tickets
        guideAdultTickets++;
        
        guidesWithTickets.push({
          guideName: guide.name || "Unknown Guide",
          guideType: guide.guideType,
          ticketType: 'adult'
        });
      }
    }
    
    // Calculate total
    const totalTicketsRequired = 
      adultParticipants + 
      childParticipants + 
      guideAdultTickets + 
      guideChildTickets;
    
    return {
      participantAdultCount: adultParticipants,
      participantChildCount: childParticipants,
      guideAdultTickets,
      guideChildTickets,
      totalTicketsRequired,
      guidesWithTickets
    };
  },
  
  /**
   * Save ticket requirements to the database to cache results
   */
  async saveTicketRequirements(
    tourId: string, 
    requirements: UnifiedTicketResult
  ): Promise<boolean> {
    try {
      logger.debug("Saving ticket requirements for tour:", tourId);
      
      const { data, error: existingError } = await supabase
        .from('ticket_requirements')
        .select('id')
        .eq('tour_id', tourId)
        .maybeSingle();
      
      const { 
        participantAdultCount, 
        participantChildCount,
        guideAdultTickets,
        guideChildTickets,
        totalTicketsRequired
      } = requirements;
      
      if (data?.id) {
        // Update existing record
        const { error } = await supabase
          .from('ticket_requirements')
          .update({
            participant_adult_tickets: participantAdultCount,
            participant_child_tickets: participantChildCount,
            guide_adult_tickets: guideAdultTickets,
            guide_child_tickets: guideChildTickets,
            total_tickets_required: totalTicketsRequired,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.id);
          
        if (error) {
          logger.error("Error updating ticket requirements:", error);
          return false;
        }
      } else {
        // Insert new record
        const { error } = await supabase
          .from('ticket_requirements')
          .insert({
            tour_id: tourId,
            participant_adult_tickets: participantAdultCount,
            participant_child_tickets: participantChildCount,
            guide_adult_tickets: guideAdultTickets,
            guide_child_tickets: guideChildTickets,
            total_tickets_required: totalTicketsRequired
          });
          
        if (error) {
          logger.error("Error inserting ticket requirements:", error);
          return false;
        }
      }
      
      return true;
    } catch (err) {
      logger.error("Error saving ticket requirements:", err);
      return false;
    }
  },
  
  /**
   * Retrieve cached ticket requirements from database
   */
  async getTicketRequirements(tourId: string): Promise<UnifiedTicketResult | null> {
    try {
      const { data, error } = await supabase
        .from('ticket_requirements')
        .select('*')
        .eq('tour_id', tourId)
        .maybeSingle();
        
      if (error || !data) {
        return null;
      }
      
      return {
        participantAdultCount: data.participant_adult_tickets,
        participantChildCount: data.participant_child_tickets,
        guideAdultTickets: data.guide_adult_tickets,
        guideChildTickets: data.guide_child_tickets,
        totalTicketsRequired: data.total_tickets_required,
        guidesWithTickets: [] // We don't store this detail in the database
      };
    } catch (err) {
      logger.error("Error retrieving ticket requirements:", err);
      return null;
    }
  }
};
