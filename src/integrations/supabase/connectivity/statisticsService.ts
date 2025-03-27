
import { supabase } from '@/integrations/supabase/client';
import { queryCache } from '../cache';
import { logger } from '@/utils/logger';
import { TourStatistics } from '@/hooks/tour-details/useTourStatistics';

/**
 * Fetch tour statistics from the materialized view
 */
export const getTourStatistics = async (tourId: string): Promise<TourStatistics | null> => {
  if (!tourId) return null;
  
  try {
    // Query the materialized view directly
    const { data, error } = await supabase
      .from('tour_statistics')
      .select('*')
      .eq('tour_id', tourId)
      .single();
      
    if (error) {
      logger.error("Error fetching tour statistics:", error);
      return null;
    }
    
    return data as TourStatistics;
  } catch (err) {
    logger.error("Exception fetching tour statistics:", err);
    return null;
  }
};

/**
 * Refresh the materialized view to update statistics
 */
export const refreshTourStatistics = async (tourId: string): Promise<boolean> => {
  if (!tourId) return false;
  
  try {
    // We can manually refresh the materialized view if needed
    const { error } = await supabase.rpc('refresh_tour_statistics');
    
    if (error) {
      logger.error("Error refreshing tour statistics:", error);
      return false;
    }
    
    // Invalidate cache entries
    queryCache.invalidate(`tour_${tourId}`);
    queryCache.invalidate(`tour_statistics_${tourId}`);
    
    return true;
  } catch (err) {
    logger.error("Exception refreshing tour statistics:", err);
    return false;
  }
};

/**
 * Calculate the total tickets required for a tour
 */
export const calculateTotalTicketsRequired = (
  adultParticipants: number,
  childParticipants: number,
  adultGuides: number,
  childGuides: number
): number => {
  return (adultParticipants || 0) + 
         (childParticipants || 0) + 
         (adultGuides || 0) + 
         (childGuides || 0);
};

/**
 * Save ticket requirements for a tour
 */
export const saveTicketRequirements = async (
  tourId: string,
  adultParticipants: number,
  childParticipants: number,
  adultGuides: number,
  childGuides: number
): Promise<boolean> => {
  try {
    const totalTickets = calculateTotalTicketsRequired(
      adultParticipants,
      childParticipants,
      adultGuides,
      childGuides
    );
    
    // Check if an entry already exists
    const { data: existing, error: checkError } = await supabase
      .from('ticket_requirements')
      .select('id')
      .eq('tour_id', tourId)
      .maybeSingle();
      
    if (checkError) {
      logger.error("Error checking existing ticket requirements:", checkError);
      return false;
    }
    
    // Update or insert as needed
    if (existing?.id) {
      // Update existing record
      const { error } = await supabase
        .from('ticket_requirements')
        .update({
          participant_adult_tickets: adultParticipants,
          participant_child_tickets: childParticipants,
          guide_adult_tickets: adultGuides,
          guide_child_tickets: childGuides,
          total_tickets_required: totalTickets,
          updated_at: new Date().toISOString(),
          timestamp: new Date().toISOString()
        })
        .eq('tour_id', tourId);
        
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
          participant_adult_tickets: adultParticipants,
          participant_child_tickets: childParticipants,
          guide_adult_tickets: adultGuides,
          guide_child_tickets: childGuides,
          total_tickets_required: totalTickets
        });
        
      if (error) {
        logger.error("Error inserting ticket requirements:", error);
        return false;
      }
    }
    
    // Invalidate any cached data for this tour
    queryCache.invalidate(`tour_${tourId}`);
    queryCache.invalidate(`tour_statistics_${tourId}`);
    
    return true;
  } catch (err) {
    logger.error("Exception in saveTicketRequirements:", err);
    return false;
  }
};
