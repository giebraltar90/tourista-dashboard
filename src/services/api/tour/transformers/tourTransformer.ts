
import { TourCardProps } from "@/components/tours/tour-card/types";

/**
 * Transform Supabase tour data into the application's TourCardProps format
 */
export const transformSupabaseToursData = (
  supabaseTours: any[], 
  guideMap: Record<string, string>
): TourCardProps[] => {
  return supabaseTours.map(tour => {
    // Use guideMap to resolve guide names from IDs
    const guide1 = tour.guide1_id && guideMap[tour.guide1_id] ? guideMap[tour.guide1_id] : tour.guide1_id || "";
    const guide2 = tour.guide2_id && guideMap[tour.guide2_id] ? guideMap[tour.guide2_id] : tour.guide2_id || "";
    const guide3 = tour.guide3_id && guideMap[tour.guide3_id] ? guideMap[tour.guide3_id] : tour.guide3_id || "";
    
    // Transform tour groups
    const tourGroups = Array.isArray(tour.tour_groups) ? tour.tour_groups.map(group => {
      const guideName = group.guide_id && guideMap[group.guide_id] ? guideMap[group.guide_id] : undefined;
      
      return {
        id: group.id,
        name: group.name || "",
        size: group.size || 0,
        entryTime: group.entry_time || "",
        childCount: group.child_count || 0,
        guideId: group.guide_id || undefined,
        guideName,
        participants: []  // Initialize with empty array; participants are fetched separately
      };
    }) : [];
    
    return {
      id: tour.id,
      date: new Date(tour.date),
      location: tour.location,
      tourName: tour.tour_name,
      tourType: tour.tour_type,
      startTime: tour.start_time,
      referenceCode: tour.reference_code,
      guide1,
      guide2,
      guide3,
      guide1Id: tour.guide1_id || "",
      guide2Id: tour.guide2_id || "",
      guide3Id: tour.guide3_id || "",
      tourGroups,
      numTickets: tour.num_tickets || 0,
      isHighSeason: tour.is_high_season === true
    };
  });
};
