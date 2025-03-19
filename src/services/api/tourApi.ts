
import { TourCardProps } from "@/components/tours/tour-card/types";
import { fetchTourFromSupabase, fetchTourFromAPI } from "./tourFetchApi";
import { fetchToursFromSupabase, fetchToursFromAPI } from "./tourFetchApi";

/**
 * Fetch tours from Ventrata API or Supabase
 */
export const fetchTours = async (params?: { 
  startDate?: string; 
  endDate?: string;
  location?: string;
}): Promise<TourCardProps[]> => {
  try {
    // First try to fetch from Supabase for real data
    try {
      const supabaseTours = await fetchToursFromSupabase(params);
      if (supabaseTours && supabaseTours.length > 0) {
        return supabaseTours;
      }
    } catch (supabaseError) {
      console.error("Error fetching from Supabase:", supabaseError);
      // Continue to API fallback
    }
    
    // Fallback to API
    return await fetchToursFromAPI(params);
  } catch (error) {
    console.error("Error fetching tours:", error);
    throw error;
  }
};

/**
 * Fetch a single tour by ID
 */
export const fetchTourById = async (tourId: string): Promise<TourCardProps | null> => {
  try {
    // Check if this is a UUID format ID to determine storage approach
    const tourIsUuid = isUuid(tourId);
    
    if (tourIsUuid) {
      // Try to fetch from Supabase for real UUID tour IDs
      try {
        const tour = await fetchTourFromSupabase(tourId);
        if (tour) {
          return tour;
        }
      } catch (supabaseError) {
        console.error("Error fetching from Supabase:", supabaseError);
        // Continue to API fallback
      }
    }
    
    // Fallback to API
    return await fetchTourFromAPI(tourId);
    
  } catch (error) {
    console.error(`Error fetching tour ${tourId}:`, error);
    throw error;
  }
};

// Re-export from other files
export { updateTourGroups } from "./tourGroupApi";
export { updateTourCapacity } from "./tourCapacityApi";
export { isUuid } from "@/types/ventrata";
