
import { TourCardProps } from "@/components/tours/tour-card/types";
import { fetchTourFromSupabase, fetchTourFromAPI } from "./tourFetchApi";
import { fetchToursFromSupabase, fetchToursFromAPI } from "./tourFetchApi";
import { isUuid } from "@/types/ventrata";
import { supabase } from "@/integrations/supabase/client";

// Helper function to get guide names from their IDs
const getGuideNames = async (guideIds: string[]) => {
  if (!guideIds.length) return {};
  
  const validIds = guideIds.filter(id => id && isUuid(id));
  
  if (!validIds.length) return {};
  
  const { data, error } = await supabase
    .from('guides')
    .select('id, name')
    .in('id', validIds);
    
  if (error || !data) {
    console.error("Error fetching guide names:", error);
    return {};
  }
  
  return data.reduce((map, guide) => {
    map[guide.id] = guide.name;
    return map;
  }, {});
};

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
        // Collect guide IDs to fetch their names
        const guideIds = new Set<string>();
        supabaseTours.forEach(tour => {
          if (tour.guide1 && isUuid(tour.guide1)) guideIds.add(tour.guide1);
          if (tour.guide2 && isUuid(tour.guide2)) guideIds.add(tour.guide2);
          if (tour.guide3 && isUuid(tour.guide3)) guideIds.add(tour.guide3);
        });
        
        // Get guide names
        const guideNames = await getGuideNames(Array.from(guideIds));
        
        // Replace guide IDs with guide names
        return supabaseTours.map(tour => ({
          ...tour,
          guide1: guideNames[tour.guide1] || tour.guide1,
          guide2: guideNames[tour.guide2] || tour.guide2,
          guide3: guideNames[tour.guide3] || tour.guide3
        }));
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
          // Get guide names if they're UUIDs
          const guideIds = [];
          if (tour.guide1 && isUuid(tour.guide1)) guideIds.push(tour.guide1);
          if (tour.guide2 && isUuid(tour.guide2)) guideIds.push(tour.guide2);
          if (tour.guide3 && isUuid(tour.guide3)) guideIds.push(tour.guide3);
          
          const guideNames = await getGuideNames(guideIds);
          
          return {
            ...tour,
            guide1: guideNames[tour.guide1] || tour.guide1,
            guide2: guideNames[tour.guide2] || tour.guide2,
            guide3: guideNames[tour.guide3] || tour.guide3
          };
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
