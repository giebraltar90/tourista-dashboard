
import { fetchTourFromSupabase } from '@/services/api/tour/fetchSupabaseTour';
import { TourCardProps } from '@/components/tours/tour-card/types';
import { normalizeTourData } from '../helpers/normalizeTourData';
import { mockTours } from '@/data/mockData';
import { toast } from 'sonner';

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
    // Try to fetch from Supabase first
    const tourData = await fetchTourFromSupabase(tourId);
    
    if (tourData) {
      return normalizeTourData(tourData, tourId);
    }
    
    // If no data found in Supabase, use fallback to mock data
    console.log(`No tour data found in Supabase for tour ${tourId}, using mock data`);
    const mockTour = mockTours.find(tour => tour.id === tourId);
    
    if (mockTour) {
      return normalizeTourData(mockTour, tourId);
    }
    
    return null;
  } catch (error) {
    console.error(`Error in fetchTourData for tour ${tourId}:`, error);
    
    // Show error toast
    toast.error(`Failed to fetch tour data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    // Fallback to mock data when there's an error
    console.log(`Error fetching tour ${tourId}, using mock data`);
    const mockTour = mockTours.find(tour => tour.id === tourId);
    
    if (mockTour) {
      return normalizeTourData(mockTour, tourId);
    }
    
    return null;
  }
};
