
import { fetchTourFromSupabase } from '@/services/api/tour/fetchSupabaseTour';
import { TourCardProps } from '@/components/tours/tour-card/types';
import { normalizeTourData } from '../helpers/normalizeTourData';
import { mockTours } from '@/data/mockData';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

/**
 * Service function to fetch tour data with error handling
 */
export const fetchTourData = async (tourId: string): Promise<TourCardProps | null> => {
  // Guard against empty tour IDs
  if (!tourId) {
    console.error('fetchTourData called with empty tourId');
    return null;
  }
  
  try {
    logger.debug(`🔍 [fetchTourData] Fetching tour data for ID: ${tourId}`);
    
    // Try to fetch from Supabase first
    const tourData = await fetchTourFromSupabase(tourId);
    
    if (tourData) {
      logger.debug(`🔍 [fetchTourData] Successfully fetched tour data from Supabase for ID: ${tourId}`);
      return normalizeTourData(tourData, tourId);
    }
    
    // If no data found in Supabase, use fallback to mock data
    logger.debug(`🔍 [fetchTourData] No tour data found in Supabase for ID: ${tourId}, trying mock data`);
    
    const mockTour = mockTours.find(tour => tour.id === tourId);
    
    if (mockTour) {
      logger.debug(`🔍 [fetchTourData] Found mock data for tour ID: ${tourId}`);
      return normalizeTourData(mockTour, tourId);
    }
    
    logger.error(`🔍 [fetchTourData] No tour data found for ID: ${tourId} in Supabase or mock data`);
    return null;
  } catch (error) {
    logger.error(`🔍 [fetchTourData] Error fetching tour data for ID: ${tourId}:`, error);
    
    // Fallback to mock data when there's an error
    logger.debug(`🔍 [fetchTourData] Trying mock data fallback for tour ID: ${tourId}`);
    const mockTour = mockTours.find(tour => tour.id === tourId);
    
    if (mockTour) {
      logger.debug(`🔍 [fetchTourData] Successfully found mock data for tour ID: ${tourId}`);
      return normalizeTourData(mockTour, tourId);
    }
    
    // If we reach here, we couldn't find any data
    return null;
  }
};
