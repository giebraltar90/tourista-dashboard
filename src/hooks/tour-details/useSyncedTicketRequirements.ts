
import { useEffect, useState } from 'react';
import { logger } from '@/utils/logger';
import { storeTicketRequirements, getTicketRequirements, TourTicketRequirements } from '@/services/api/tour/tourTicketService';
import { EventEmitter } from '@/utils/eventEmitter';

/**
 * Hook to keep ticket requirements in sync with the database
 */
export const useSyncedTicketRequirements = (
  tourId: string,
  participantAdultTickets: number,
  participantChildTickets: number,
  guideAdultTickets: number,
  guideChildTickets: number
) => {
  const [storedRequirements, setStoredRequirements] = useState<TourTicketRequirements | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsSync, setNeedsSync] = useState(false);
  
  // Calculate totals for comparison
  const calculatedTotal = 
    participantAdultTickets + 
    participantChildTickets + 
    guideAdultTickets + 
    guideChildTickets;
    
  // Load stored requirements from the database
  useEffect(() => {
    if (!tourId) return;
    
    const loadRequirements = async () => {
      setIsLoading(true);
      try {
        const requirements = await getTicketRequirements(tourId);
        setStoredRequirements(requirements);
        
        // Check if we need to sync
        if (requirements) {
          const storedTotal = requirements.totalTicketsRequired;
          setNeedsSync(calculatedTotal !== storedTotal);
          
          logger.debug(`Ticket requirements comparison for tour ${tourId}:`, {
            calculatedTotal,
            storedTotal,
            needsSync: calculatedTotal !== storedTotal
          });
        } else {
          // No stored requirements yet, so we need to sync
          setNeedsSync(true);
        }
      } catch (error) {
        logger.error(`Error loading ticket requirements for tour ${tourId}:`, error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRequirements();
  }, [tourId, calculatedTotal]);
  
  // Sync requirements when needed
  useEffect(() => {
    if (!tourId || !needsSync || isLoading) return;
    
    const syncRequirements = async () => {
      logger.debug(`Syncing ticket requirements for tour ${tourId}:`, {
        participantAdultTickets,
        participantChildTickets,
        guideAdultTickets,
        guideChildTickets,
        total: calculatedTotal
      });
      
      const success = await storeTicketRequirements(
        tourId,
        participantAdultTickets,
        participantChildTickets,
        guideAdultTickets,
        guideChildTickets
      );
      
      if (success) {
        setNeedsSync(false);
        // Update stored requirements
        const newRequirements = await getTicketRequirements(tourId);
        setStoredRequirements(newRequirements);
      }
    };
    
    syncRequirements();
  }, [tourId, needsSync, isLoading, participantAdultTickets, participantChildTickets, guideAdultTickets, guideChildTickets, calculatedTotal]);
  
  // Listen for events that should trigger a re-sync
  useEffect(() => {
    const handleGuideChange = () => {
      logger.debug(`Guide change detected for tour ${tourId}, marking for ticket requirement sync`);
      setNeedsSync(true);
    };
    
    const handleParticipantChange = () => {
      logger.debug(`Participant change detected for tour ${tourId}, marking for ticket requirement sync`);
      setNeedsSync(true);
    };
    
    const handleTicketRequirementsChanged = (data: any) => {
      logger.debug(`Ticket requirements updated for tour ${tourId}:`, data);
      setStoredRequirements(prev => ({
        ...prev,
        ...data,
        timestamp: new Date().toISOString()
      }));
      setNeedsSync(false);
    };
    
    // Register for relevant events
    EventEmitter.on(`guide-change:${tourId}`, handleGuideChange);
    EventEmitter.on(`participant-change:${tourId}`, handleParticipantChange);
    EventEmitter.on(`ticket-requirements-updated:${tourId}`, handleTicketRequirementsChanged);
    
    return () => {
      // Cleanup event listeners
      EventEmitter.off(`guide-change:${tourId}`, handleGuideChange);
      EventEmitter.off(`participant-change:${tourId}`, handleParticipantChange);
      EventEmitter.off(`ticket-requirements-updated:${tourId}`, handleTicketRequirementsChanged);
    };
  }, [tourId]);
  
  return {
    storedRequirements,
    isLoading,
    needsSync,
    forceSync: () => setNeedsSync(true)
  };
};
