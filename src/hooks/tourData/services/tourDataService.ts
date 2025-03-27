
import { fetchTourFromSupabase } from '@/services/api/tour/fetchSupabaseTour';
import { TourCardProps } from '@/components/tours/tour-card/types';
import { normalizeTourData } from '../helpers/normalizeTourData';
import { mockTours } from '@/data/mockData';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

/**
 * Service function to fetch tour data with improved error handling
 */
export const fetchTourData = async (tourId: string): Promise<TourCardProps | null> => {
  // Guard against empty tour IDs
  if (!tourId) {
    logger.error('fetchTourData called with empty tourId');
    return null;
  }
  
  try {
    // Log the start of the fetch operation
    logger.debug(`Starting tour data fetch for ID: ${tourId}`);
    
    // Try to fetch from Supabase first
    const tourData = await fetchTourFromSupabase(tourId);
    
    if (tourData) {
      logger.debug(`Tour data fetched successfully from Supabase for ID ${tourId}`, {
        rawData: JSON.stringify(tourData).slice(0, 200) + '...',
        hasGroups: Array.isArray(tourData.tourGroups),
        groupsCount: Array.isArray(tourData.tourGroups) ? tourData.tourGroups.length : 0,
        location: tourData.location || 'Unknown'
      });
      
      // Normalize data to ensure consistent format and safe date handling
      try {
        const normalizedTour = normalizeTourData(tourData, tourId);
        
        // Log successful normalization
        logger.debug(`Tour data normalized successfully for ID ${tourId}`, {
          normalizedName: normalizedTour.tourName,
          normalizedLocation: normalizedTour.location,
          groupsCount: normalizedTour.tourGroups.length,
          date: normalizedTour.date instanceof Date ? normalizedTour.date.toISOString() : String(normalizedTour.date)
        });
        
        return normalizedTour;
      } catch (normalizeError) {
        logger.error(`Failed to normalize tour data for ID ${tourId}:`, normalizeError);
        throw normalizeError;
      }
    }
    
    // If no data found in Supabase, use fallback to mock data
    logger.info(`No tour data found in Supabase for tour ${tourId}, using mock data`);
    const mockTour = mockTours.find(tour => tour.id === tourId);
    
    if (mockTour) {
      logger.debug(`Found matching mock tour for ID ${tourId}`);
      try {
        return normalizeTourData(mockTour, tourId);
      } catch (normalizeError) {
        logger.error(`Failed to normalize mock tour data for ID ${tourId}:`, normalizeError);
        // Return the raw mock data as a last resort
        return { ...mockTour, id: tourId } as TourCardProps;
      }
    }
    
    // If neither source has the tour, log the issue
    logger.error(`No tour found with ID ${tourId} in either database or mock data`);
    toast.error("Tour not found. Please check the ID and try again.");
    return null;
  } catch (error) {
    logger.error(`Error in fetchTourData for tour ${tourId}:`, error);
    
    // Show error toast
    toast.error(`Failed to fetch tour data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    // Fallback to mock data when there's an error
    logger.info(`Error fetching tour ${tourId}, using mock data as fallback`);
    const mockTour = mockTours.find(tour => tour.id === tourId);
    
    if (mockTour) {
      logger.debug(`Found matching mock tour for ID ${tourId} to use as fallback`);
      try {
        return normalizeTourData(mockTour, tourId);
      } catch (normalizeError) {
        logger.error(`Failed to normalize mock tour fallback data for ID ${tourId}:`, normalizeError);
        // Return the raw mock data as a last resort
        return { ...mockTour, id: tourId } as TourCardProps;
      }
    }
    
    return null;
  }
};
