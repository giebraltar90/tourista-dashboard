
import { fetchTourFromSupabase } from '@/services/api/tour/fetchSupabaseTour';
import { TourCardProps } from '@/components/tours/tour-card/types';
import { normalizeTourData } from '../helpers/normalizeTourData';

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
    const tourData = await fetchTourFromSupabase(tourId);
    return normalizeTourData(tourData, tourId);
  } catch (error) {
    console.error(`Error in fetchTourData for tour ${tourId}:`, error);
    return null;
  }
};
