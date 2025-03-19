
import { TourCardProps } from "@/components/tours/tour-card/types";
import { supabase } from "@/integrations/supabase/client";

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
