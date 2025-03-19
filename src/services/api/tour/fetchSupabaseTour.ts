
import { TourCardProps } from "@/components/tours/tour-card/types";
import { supabase } from "@/integrations/supabase/client";
import { isValidUuid } from "@/services/api/utils/guidesUtils";
import { TourModification } from "@/types/ventrata";

/**
 * Fetch a single tour from Supabase
 */
export const fetchTourFromSupabase = async (tourId: string): Promise<TourCardProps | null> => {
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
      
    if (error) {
      console.error("Error fetching tour:", error);
      return null;
    }
    
    // Get modifications
    const { data: modifications, error: modError } = await supabase
      .from('modifications')
      .select('*')
      .eq('tour_id', tourId)
      .order('created_at', { ascending: false });
      
    if (modError) {
      console.error("Error fetching modifications:", modError);
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
        tourGroups: tour.tour_groups ? tour.tour_groups.map(group => ({
          id: group.id,
          name: group.name,
          size: group.size,
          entryTime: group.entry_time,
          childCount: group.child_count || 0,
          guideId: group.guide_id
        })) : [],
        numTickets: tour.num_tickets || 0,
        isHighSeason: Boolean(tour.is_high_season),
        modifications: modifications ? modifications.map(mod => ({
          id: mod.id,
          date: new Date(mod.created_at),
          user: mod.user_id || "System",
          description: mod.description,
          status: mod.status,
          details: mod.details || {}
        })) : []
      };
    }
  } catch (error) {
    console.error("Error in fetchTourFromSupabase:", error);
  }
  
  return null;
};
