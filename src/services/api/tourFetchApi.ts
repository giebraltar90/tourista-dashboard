
import { VentrataTour } from "@/types/ventrata";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { mockTours } from "@/data/mockData";
import { API_BASE_URL, headers } from "./apiConfig";
import { supabase } from "@/integrations/supabase/client";
import { isUuid } from "@/types/ventrata";
import { transformTours } from "@/hooks/tourData/helpers";

/**
 * Fetch tours from Supabase
 */
export const fetchToursFromSupabase = async (params?: {
  startDate?: string;
  endDate?: string;
  location?: string;
}): Promise<TourCardProps[]> => {
  // Build query
  let query = supabase
    .from('tours')
    .select(`
      id, date, location, tour_name, tour_type, start_time, 
      reference_code, guide1_id, guide2_id, guide3_id, 
      num_tickets, is_high_season,
      tour_groups (id, name, size, entry_time, guide_id, child_count)
    `)
    .order('date', { ascending: true });

  // Add filters if provided
  if (params?.location) {
    query = query.eq('location', params.location);
  }
  
  if (params?.startDate) {
    query = query.gte('date', params.startDate);
  }
  
  if (params?.endDate) {
    query = query.lte('date', params.endDate);
  }
    
  const { data: supabaseTours, error } = await query;
    
  if (error) {
    throw error;
  }
  
  if (supabaseTours && supabaseTours.length > 0) {
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
        guideId: group.guide_id,
        id: group.id
      })),
      numTickets: tour.num_tickets || 0,
      isHighSeason: tour.is_high_season || false
    }));
  }
  
  return [];
};

/**
 * Fetch tours from API
 */
export const fetchToursFromAPI = async (params?: {
  startDate?: string;
  endDate?: string;
  location?: string;
}): Promise<TourCardProps[]> => {
  // Build query parameters
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);
  if (params?.location) queryParams.append("location", params.location);
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
  
  try {
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
    console.error("Error fetching tours from API:", error);
    // In case of API failure, return mock data as fallback
    return mockTours;
  }
};

/**
 * Fetch a single tour from Supabase
 */
export const fetchTourFromSupabase = async (tourId: string): Promise<TourCardProps | null> => {
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
    
  if (error) {
    throw error;
  }
  
  if (tour) {
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
  
  return null;
};

/**
 * Fetch a single tour from API
 */
export const fetchTourFromAPI = async (tourId: string): Promise<TourCardProps | null> => {
  try {
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
    console.error(`Error fetching tour ${tourId} from API:`, error);
    // Return mock data as fallback
    return mockTours.find(tour => tour.id === tourId) || null;
  }
};
