
import { TourCardProps } from "@/components/tours/tour-card/types";
import { supabase } from "@/integrations/supabase/client";
import { isUuid } from "@/types/ventrata";

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
