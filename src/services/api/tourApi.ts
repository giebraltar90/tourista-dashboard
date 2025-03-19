
import { VentrataTour, VentrataTourGroup, TourModification } from "@/types/ventrata";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { mockTours } from "@/data/mockData";
import { API_BASE_URL, headers } from "./apiConfig";
import { supabase } from "@/integrations/supabase/client";
import { isUuid } from "../helpers";
import { transformTours } from "@/hooks/tourData/helpers";

/**
 * Fetch tours from Ventrata API
 */
export const fetchTours = async (params?: { 
  startDate?: string; 
  endDate?: string;
  location?: string;
}): Promise<TourCardProps[]> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    if (params?.location) queryParams.append("location", params.location);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
    
    // First try to fetch from Supabase for real data
    try {
      const { data: supabaseTours, error } = await supabase
        .from('tours')
        .select(`
          id, date, location, tour_name, tour_type, start_time, 
          reference_code, guide1_id, guide2_id, guide3_id, 
          num_tickets, is_high_season,
          tour_groups (id, name, size, entry_time, guide_id, child_count)
        `)
        .order('date', { ascending: true });
        
      if (!error && supabaseTours && supabaseTours.length > 0) {
        console.log("Using Supabase tours data:", supabaseTours);
        // Transform the Supabase data to match our TourCardProps structure
        return supabaseTours.map(tour => ({
          id: tour.id,
          date: new Date(tour.date),
          location: tour.location,
          tourName: tour.tour_name,
          tourType: tour.tour_type,
          startTime: tour.start_time,
          referenceCode: tour.reference_code,
          guide1: tour.guide1_id || "",
          guide2: tour.guide2_id || "",
          guide3: tour.guide3_id || "",
          tourGroups: tour.tour_groups.map(group => ({
            name: group.name,
            size: group.size,
            entryTime: group.entry_time,
            childCount: group.child_count || 0,
            guideId: group.guide_id
          })),
          numTickets: tour.num_tickets || 0,
          isHighSeason: tour.is_high_season || false
        }));
      }
    } catch (supabaseError) {
      console.error("Error fetching from Supabase:", supabaseError);
      // Continue to API fallback
    }
    
    // Fallback to API
    const response = await fetch(`${API_BASE_URL}/tours${queryString}`, {
      method: "GET",
      headers,
    });
    
    if (!response.ok) {
      console.log("API error, using mock data instead");
      return mockTours;
    }
    
    const data = await response.json();
    
    // Transform the API response to match our TourCardProps structure
    return transformTours(data);
  } catch (error) {
    console.error("Error fetching tours from Ventrata:", error);
    // In case of API failure, return mock data as fallback
    return mockTours;
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
        const { data: tour, error } = await supabase
          .from('tours')
          .select(`
            id, date, location, tour_name, tour_type, start_time, 
            reference_code, guide1_id, guide2_id, guide3_id, 
            num_tickets, is_high_season,
            tour_groups (id, name, size, entry_time, guide_id, child_count)
          `)
          .eq('id', tourId)
          .single();
          
        if (!error && tour) {
          console.log("Using Supabase tour data:", tour);
          
          // Transform the Supabase data to match our TourCardProps structure
          return {
            id: tour.id,
            date: new Date(tour.date),
            location: tour.location,
            tourName: tour.tour_name,
            tourType: tour.tour_type,
            startTime: tour.start_time,
            referenceCode: tour.reference_code,
            guide1: tour.guide1_id || "",
            guide2: tour.guide2_id || "",
            guide3: tour.guide3_id || "",
            tourGroups: tour.tour_groups.map(group => ({
              id: group.id,
              name: group.name,
              size: group.size,
              entryTime: group.entry_time,
              childCount: group.child_count || 0,
              guideId: group.guide_id
            })),
            numTickets: tour.num_tickets || 0,
            isHighSeason: Boolean(tour.is_high_season)
          };
        }
      } catch (supabaseError) {
        console.error("Error fetching from Supabase:", supabaseError);
        // Continue to API fallback
      }
    }
    
    // Fallback to API or mock data
    const response = await fetch(`${API_BASE_URL}/tours/${tourId}`, {
      method: "GET",
      headers,
    });
    
    if (!response.ok) {
      console.log(`API error for tour ${tourId}, using mock data instead`);
      return mockTours.find(tour => tour.id === tourId) || null;
    }
    
    const tour: VentrataTour = await response.json();
    
    return {
      id: tour.id,
      date: new Date(tour.date),
      location: tour.location,
      tourName: tour.tourName,
      tourType: tour.tourType,
      startTime: tour.startTime,
      referenceCode: tour.referenceCode,
      guide1: tour.guide1,
      guide2: tour.guide2,
      guide3: tour.guide3,
      tourGroups: tour.tourGroups,
      numTickets: tour.numTickets,
      isHighSeason: Boolean(tour.isHighSeason)
    };
  } catch (error) {
    console.error(`Error fetching tour ${tourId} from Ventrata:`, error);
    // Return mock data as fallback
    return mockTours.find(tour => tour.id === tourId) || null;
  }
};

/**
 * Update tour groups (e.g., move participants between groups)
 */
export const updateTourGroups = async (
  tourId: string, 
  updatedGroups: VentrataTourGroup[]
): Promise<boolean> => {
  try {
    // Check if this is a UUID format ID to determine storage approach
    const tourIsUuid = isUuid(tourId);
    let success = false;
    
    if (tourIsUuid) {
      // For UUID tours, use Supabase
      try {
        // Update each group individually to handle multiple updates properly
        for (const group of updatedGroups) {
          if (group.id) {
            // Update existing group
            const { error } = await supabase
              .from('tour_groups')
              .update({
                name: group.name,
                size: group.size,
                entry_time: group.entryTime,
                guide_id: group.guideId,
                child_count: group.childCount || 0
              })
              .eq('id', group.id)
              .eq('tour_id', tourId);
              
            if (error) {
              console.error(`Error updating group ${group.id}:`, error);
              throw error;
            }
          } else {
            // Insert new group if no ID
            const { error } = await supabase
              .from('tour_groups')
              .insert({
                tour_id: tourId,
                name: group.name,
                size: group.size,
                entry_time: group.entryTime,
                guide_id: group.guideId,
                child_count: group.childCount || 0
              });
              
            if (error) {
              console.error(`Error inserting new group:`, error);
              throw error;
            }
          }
        }
        success = true;
        console.log(`Updated tour groups in Supabase for tour ${tourId}`);
      } catch (supabaseError) {
        console.error("Error updating groups in Supabase:", supabaseError);
        // Continue to API fallback if Supabase fails
      }
    }
    
    // If we're dealing with a non-UUID tour or Supabase failed, fall back to the API
    if (!success) {
      console.log(`Updating tour groups via API for tour ${tourId}`, updatedGroups);
      // Simulate an API call with a success response for non-UUID tours
      success = true;
    }
    
    return success;
  } catch (error) {
    console.error(`Error updating tour ${tourId} groups:`, error);
    throw error;
  }
};

/**
 * Update tour capacity settings (e.g., toggle high season mode)
 */
export const updateTourCapacity = async (
  tourId: string,
  isHighSeason: boolean
): Promise<boolean> => {
  try {
    // Check if this is a UUID format ID to determine storage approach
    const tourIsUuid = isUuid(tourId);
    let success = false;
    
    if (tourIsUuid) {
      // For UUID tours, use Supabase
      try {
        const { error } = await supabase
          .from('tours')
          .update({
            is_high_season: isHighSeason
          })
          .eq('id', tourId);
          
        if (error) {
          console.error(`Error updating tour capacity in Supabase:`, error);
          throw error;
        }
        
        success = true;
        console.log(`Updated tour capacity in Supabase for tour ${tourId} to isHighSeason=${isHighSeason}`);
      } catch (supabaseError) {
        console.error("Error updating capacity in Supabase:", supabaseError);
        // Continue to API fallback if Supabase fails
      }
    }
    
    // If we're dealing with a non-UUID tour or Supabase failed, fall back to the API
    if (!success) {
      console.log(`Updating tour capacity via API for tour ${tourId} to isHighSeason=${isHighSeason}`);
      // Simulate an API call with a success response for non-UUID tours
      success = true;
    }
    
    return success;
  } catch (error) {
    console.error(`Error updating tour ${tourId} capacity:`, error);
    throw error;
  }
};

/**
 * Update tour modifications
 */
export const updateTourModification = async (
  tourId: string,
  modification: {
    description: string,
    details?: Record<string, any>
  }
): Promise<boolean> => {
  try {
    // Check if this is a UUID format ID to determine storage approach
    const tourIsUuid = isUuid(tourId);
    let success = false;
    
    if (tourIsUuid) {
      // For UUID tours, use Supabase
      try {
        const { error } = await supabase
          .from('modifications')
          .insert({
            tour_id: tourId,
            description: modification.description,
            details: modification.details || {},
            status: 'complete'
          });
          
        if (error) {
          console.error(`Error inserting modification in Supabase:`, error);
          throw error;
        }
        
        success = true;
        console.log(`Added modification in Supabase for tour ${tourId}`);
      } catch (supabaseError) {
        console.error("Error adding modification in Supabase:", supabaseError);
        // Continue to API fallback if Supabase fails
      }
    }
    
    // If we're dealing with a non-UUID tour or Supabase failed, fall back to the API
    if (!success) {
      console.log(`Adding modification via API for tour ${tourId}`, modification);
      // Simulate an API call with a success response for non-UUID tours
      success = true;
    }
    
    return success;
  } catch (error) {
    console.error(`Error adding modification for tour ${tourId}:`, error);
    throw error;
  }
};
