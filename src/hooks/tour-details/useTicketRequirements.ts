import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { toast } from 'sonner';
import { TourCardProps } from '@/components/tours/tour-card/types';
import { GuideInfo } from '@/types/ventrata';
import { EventEmitter, EVENTS } from '@/utils/eventEmitter';
import { calculateCompleteGuideTicketRequirements } from './services/ticket-calculation';

interface TicketRequirements {
  id?: string;
  tourId: string;
  participantAdultTickets: number;
  participantChildTickets: number;
  guideAdultTickets: number;
  guideChildTickets: number;
  totalTicketsRequired: number;
  timestamp?: Date;
}

export const useTicketRequirements = (
  tourId: string,
  tour?: TourCardProps | null,
  guide1Info?: GuideInfo | null,
  guide2Info?: GuideInfo | null,
  guide3Info?: GuideInfo | null
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [ticketRequirements, setTicketRequirements] = useState<TicketRequirements | null>(null);
  
  const loadTicketRequirements = useCallback(async () => {
    if (!tourId) return null;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('ticket_requirements')
        .select('*')
        .eq('tour_id', tourId)
        .maybeSingle();
        
      if (error) {
        logger.error(`Error loading ticket requirements for tour ${tourId}:`, error);
        return null;
      }
      
      if (data) {
        const requirements: TicketRequirements = {
          id: data.id,
          tourId: data.tour_id,
          participantAdultTickets: data.participant_adult_tickets,
          participantChildTickets: data.participant_child_tickets,
          guideAdultTickets: data.guide_adult_tickets,
          guideChildTickets: data.guide_child_tickets,
          totalTicketsRequired: data.total_tickets_required,
          timestamp: data.timestamp ? new Date(data.timestamp) : new Date()
        };
        
        setTicketRequirements(requirements);
        return requirements;
      }
      
      return null;
    } catch (error) {
      logger.error(`Unexpected error loading ticket requirements for tour ${tourId}:`, error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [tourId]);
  
  const calculateAndSaveTicketRequirements = useCallback(async () => {
    if (!tour || !tourId) return null;
    
    try {
      setIsLoading(true);
      
      const totalParticipants = tour.tourGroups.reduce(
        (sum, group) => sum + group.size, 
        0
      );
      
      const totalChildCount = tour.tourGroups.reduce(
        (sum, group) => sum + (group.childCount || 0), 
        0
      );
      
      const participantAdultTickets = totalParticipants - totalChildCount;
      const participantChildTickets = totalChildCount;
      
      const { adultTickets: guideAdultTickets, childTickets: guideChildTickets } = 
        calculateCompleteGuideTicketRequirements(tour, guide1Info, guide2Info, guide3Info, tour.location);
      
      const totalTicketsRequired = 
        participantAdultTickets + 
        participantChildTickets + 
        guideAdultTickets + 
        guideChildTickets;
      
      const requirements: TicketRequirements = {
        tourId,
        participantAdultTickets,
        participantChildTickets,
        guideAdultTickets,
        guideChildTickets,
        totalTicketsRequired
      };
      
      const { error } = await supabase
        .from('ticket_requirements')
        .upsert({
          tour_id: tourId,
          participant_adult_tickets: participantAdultTickets,
          participant_child_tickets: participantChildTickets,
          guide_adult_tickets: guideAdultTickets,
          guide_child_tickets: guideChildTickets,
          total_tickets_required: totalTicketsRequired,
          timestamp: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'tour_id' });
        
      if (error) {
        logger.error(`Error saving ticket requirements for tour ${tourId}:`, error);
        return null;
      }
      
      setTicketRequirements(requirements);
      
      EventEmitter.emit(EVENTS.TICKETS_UPDATED(tourId), requirements);
      
      return requirements;
    } catch (error) {
      logger.error(`Unexpected error calculating ticket requirements for tour ${tourId}:`, error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [tourId, tour, guide1Info, guide2Info, guide3Info]);
  
  useEffect(() => {
    loadTicketRequirements();
  }, [loadTicketRequirements]);
  
  useEffect(() => {
    if (!tourId) return;
    
    const handleGuideChange = () => {
      logger.debug(`Guide changed for tour ${tourId}, recalculating tickets`);
      calculateAndSaveTicketRequirements();
    };
    
    const handleParticipantChange = () => {
      logger.debug(`Participants changed for tour ${tourId}, recalculating tickets`);
      calculateAndSaveTicketRequirements();
    };
    
    const handleRecalculateRequest = () => {
      logger.debug(`Recalculation requested for tour ${tourId}`);
      calculateAndSaveTicketRequirements();
    };
    
    EventEmitter.on(EVENTS.GUIDE_CHANGED(tourId), handleGuideChange);
    EventEmitter.on(EVENTS.PARTICIPANT_MOVED(tourId), handleParticipantChange);
    EventEmitter.on(EVENTS.PARTICIPANT_ADDED(tourId), handleParticipantChange);
    EventEmitter.on(EVENTS.PARTICIPANT_REMOVED(tourId), handleParticipantChange);
    EventEmitter.on(EVENTS.RECALCULATE_TICKETS(tourId), handleRecalculateRequest);
    
    return () => {
      EventEmitter.off(EVENTS.GUIDE_CHANGED(tourId), handleGuideChange);
      EventEmitter.off(EVENTS.PARTICIPANT_MOVED(tourId), handleParticipantChange);
      EventEmitter.off(EVENTS.PARTICIPANT_ADDED(tourId), handleParticipantChange);
      EventEmitter.off(EVENTS.PARTICIPANT_REMOVED(tourId), handleParticipantChange);
      EventEmitter.off(EVENTS.RECALCULATE_TICKETS(tourId), handleRecalculateRequest);
    };
  }, [tourId, calculateAndSaveTicketRequirements]);
  
  return {
    ticketRequirements,
    isLoading,
    calculateAndSaveTicketRequirements,
    loadTicketRequirements
  };
};
