
import { TourCardProps } from "@/components/tours/tour-card/types";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Fetch tours that are assigned to a specific guide
 */
export const fetchToursByGuideId = async (guideId: string): Promise<TourCardProps[]> => {
  try {
    logger.debug(`Fetching tours for guide: ${guideId}`);
    
    const { data, error } = await supabase
      .from('tours')
      .select(`
        id, date, location, tour_name, tour_type, start_time, 
        reference_code, guide1_id, guide2_id, guide3_id, 
        num_tickets, is_high_season,
        tour_groups (id, name, size, entry_time, guide_id, child_count)
      `)
      .or(`guide1_id.eq.${guideId},guide2_id.eq.${guideId},guide3_id.eq.${guideId}`)
      .order('date', { ascending: true });
      
    if (error) {
      logger.error("Error fetching guide tours:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      logger.debug(`No tours found for guide: ${guideId}`);
      return [];
    }
    
    // Transform the data to match our TourCardProps structure
    return data.map(tour => ({
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
      guide1Id: tour.guide1_id || "",
      guide2Id: tour.guide2_id || "",
      guide3Id: tour.guide3_id || "",
      tourGroups: (tour.tour_groups || []).map(group => ({
        id: group.id,
        name: group.name,
        size: group.size,
        entryTime: group.entry_time,
        childCount: group.child_count || 0,
        guideId: group.guide_id,
        participants: []
      })),
      numTickets: tour.num_tickets || 0,
      isHighSeason: tour.is_high_season === true
    }));
  } catch (error) {
    logger.error("Unexpected error fetching guide tours:", error);
    throw error;
  }
};
