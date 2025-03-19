
import { TourCardProps } from "@/components/tours/tour-card/types";
import { 
  fetchTourFromSupabase, 
  fetchTourFromAPI,
  fetchToursFromSupabase, 
  fetchToursFromAPI 
} from "./tour";
import { isUuid } from "./tour/guideUtils";
import { enrichToursWithGuideNames } from "./tour/guideUtils";
import { supabase } from "@/integrations/supabase/client";

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
        // Enrich tours with guide names
        return await enrichToursWithGuideNames(supabaseTours);
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
          // Enrich tour with guide names
          const enrichedTours = await enrichToursWithGuideNames([tour]);
          return enrichedTours[0];
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

/**
 * Fetch participants for a specific tour from Supabase
 */
export const fetchParticipantsForTour = async (tourId: string) => {
  if (!tourId) return [];
  
  try {
    // First, get the tour groups for this tour
    const { data: groups, error: groupsError } = await supabase
      .from('tour_groups')
      .select('id')
      .eq('tour_id', tourId);
      
    if (groupsError) {
      console.error("Error fetching tour groups:", groupsError);
      throw groupsError;
    }
    
    if (!groups || groups.length === 0) {
      return [];
    }
    
    // Get group IDs
    const groupIds = groups.map(group => group.id);
    
    // Now fetch participants for these groups
    const { data: participants, error: participantsError } = await supabase
      .from('participants')
      .select('*')
      .in('group_id', groupIds);
      
    if (participantsError) {
      console.error("Error fetching participants:", participantsError);
      throw participantsError;
    }
    
    return participants || [];
  } catch (error) {
    console.error("Error in fetchParticipantsForTour:", error);
    return [];
  }
};

// Re-export from other files
export { updateTourGroups } from "./tourGroupApi";
export { updateTourCapacity } from "./tourCapacityApi";
export { isUuid } from "./tour/guideUtils";
